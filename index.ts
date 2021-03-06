import express from "express";
import fetch from "node-fetch";
import { URLSearchParams } from "url";
import now from 'performance-now';

import type { SecondaryInfo } from './ResponseTypes';

let cachedResponse: string;
let originalCacheTime: number;
let cachedData: { [x: string]: any; };
let cacheTime: number = 0;
let cacheTiming: {metric?: string, desc?: string, time?: number}[] = [];

const CACHE_EXPIRE_TIME = 60 * 60 * 1000;   // 1 hour

async function loadData(): Promise<SecondaryInfo> {
    cacheTiming = [];
    let startTime = now();
    const sessionResponse = await promiseTimeout(
        2000, 'Session Timeout',
        fetch('https://public.tableau.com/views/WPIPublicCommunityDashboard/DailyReport?:showVizHome=n')
    ).catch(e => {
        throw { type: 'timeout', message: e };
    });
    const sessionID = sessionResponse.headers.get('x-session-id');
    if (!sessionID) {
        throw { type: 'remoteError', message: 'No session ID' };
    }
    cacheTiming.push({metric: 'acquireSession', time: now() - startTime});


    const body = new URLSearchParams(
        {
            "sheet_id": "Daily%20Report",
        }
    );

    startTime = now();
    const response = await promiseTimeout(
        2000, 'Data Timeout',
         fetch(
        `https://public.tableau.com/vizql/w/WPIPublicCommunityDashboard/v/DailyReport/bootstrapSession/sessions/${sessionID}`,
        {
            method: 'POST',
            body,
        }
    )).catch(e => {
        throw { type: 'timeout', message: e }
    });
    cacheTiming.push({metric: 'acquireData', time: now() - startTime});

    if (!response.ok) {
        throw { type: 'remoteError', message: `Server responded with ${response.status} ${response.statusText}: ${await response.text()}` };
    }


    startTime = now();
    const responseText = await response.text();

    const prefixes = responseText.match(/\d+;\{/g);

    if (!prefixes) {
        throw { type: 'remoteError', message: `Could not find prefixes in response: ${responseText}` };
    }

    try {
        const dataText = responseText.substr(
            responseText.indexOf(prefixes[1]) + prefixes[1].length - 1
        );

        let data = JSON.parse(dataText);
        cacheTiming.push({metric: 'parseJSON', time: now() - startTime});

        return data;
    } catch (e) {
        throw { type: 'remoteError', message: `Could not parse JSON: ${e}\nInitial response: ${responseText}` };
    }

}

function parseData(data: SecondaryInfo) {
    let startTime = now();

    let parsedData: {[key: string]: number | string} = {};
    let dataDictionary: {[key: string]: number[] | string[]} = {};

    data
        .secondaryInfo
        .presModelMap
        .dataDictionary
        .presModelHolder
        .genDataDictionaryPresModel
        .dataSegments["0"]
        .dataColumns
        .forEach(column => {
            dataDictionary[column.dataType] = column.dataValues;
        });

    const modelMap = data
        .secondaryInfo
        .presModelMap
        .vizData
        .presModelHolder
        .genPresModelMapPresModel
        .presModelMap;
    
    for (const key in modelMap) {
        if (!key.includes('chart') && Object.prototype.hasOwnProperty.call(modelMap, key)) {
            const element = modelMap[key];

            const outputKey = key.replace(/ /gi, '_').replace(/-/gi, '_').toLowerCase();

            const elementData = element.presModelHolder.genVizDataPresModel.paneColumnsData;
            
            const valType = elementData.vizDataColumns[1].dataType;
            if (!valType) {
                throw `Could not find data type for ${key}`;
            }
            const val = dataDictionary[valType][elementData.paneColumnsList[0].vizPaneColumns[1].aliasIndices[0]];
            parsedData[outputKey] = val;
        }
    }
    cacheTiming.push({metric: 'dataParse', time: now() - startTime});
    
    return parsedData;
}

// Pull and parse the data
// loadData().then(
//     data => {
//         console.log(parseData(data));
//     }
// ).catch(console.warn);

// Create an express server on port 80
const app = express();

app.get('/', async (req, res) => {
    console.log('GET /');
    // Check if we have a cached response and that it hasn't expired
    res.type('json');
    // console.log({cachedResponse, cacheTime, now: Date.now(), diffTime: (Date.now() - cacheTime)});
    try {
        if (!cachedResponse || (Date.now() - cacheTime) > CACHE_EXPIRE_TIME) {
            console.log('Cache Miss!');
            await updateCache();
            res.setHeader('Server-Timing', timingArrayToString(cacheTiming));
            console.log(`Server-Timing: ${timingArrayToString(cacheTiming)}`);
        } else {
            console.log('Cache Hit!');
        }
        
        res.setHeader('Age', Math.floor((Date.now() - originalCacheTime) / 1000));
        res.setHeader('Expires', new Date(cacheTime + CACHE_EXPIRE_TIME).toUTCString());
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200);
        res.send(cachedResponse);
    } catch (e) {
        console.warn(e);
        res.status(500);
        res.send({error: e});
    }
});

app.get('/metrics', async (req, res) => {
    console.log('GET /metrics');
    // Check if we have a cached response and that it hasn't expired
    res.type('text');
    try {
        if (!cachedData || (Date.now() - cacheTime) > CACHE_EXPIRE_TIME) {
            console.log('Cache Miss!');
            await updateCache();
            res.setHeader('Server-Timing', timingArrayToString(cacheTiming));
            console.log(`Server-Timing: ${timingArrayToString(cacheTiming)}`);
        } else {
            console.log('Cache Hit!');
        }
        res.setHeader('Age', Math.floor((Date.now() - originalCacheTime) / 1000));
        res.setHeader('Expires', new Date(cacheTime + CACHE_EXPIRE_TIME).toUTCString());
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200);
        const output = [
            gaugeGenerator({help: 'The age of this data', key: 'wpi_covid_age', value: Math.floor((Date.now() - originalCacheTime) / 1000)}),
            gaugeGenerator({help: 'Percentage of tests over the last 30 days that came back positive', key: 'wpi_covid_30_day_positive_ratio', value: cachedData['30_day_positive_rate']}),
            gaugeGenerator({help: 'Number of tests over the last 30 days that came back positive', key: 'wpi_covid_30_day_positives', value: cachedData['30_day_positives']}),
            gaugeGenerator({help: 'Number of tests administered over the last 30 days', key: 'wpi_covid_30_day_tests', value: cachedData['30_day_tests']}),
            gaugeGenerator({help: 'Percentage of tests over the last 7 days that came back positive', key: 'wpi_covid_7_day_positive_ratio', value: cachedData['7_day_positive_rate']}),
            gaugeGenerator({help: 'Number of tests over the last 7 days that came back positive', key: 'wpi_covid_7_day_positives', value: cachedData['7_day_positives']}),
            gaugeGenerator({help: 'Number of tests administered over the last 7 days', key: 'wpi_covid_7_day_tests', value: cachedData['7_day_tests']}),
            gaugeGenerator({help: 'Number of people in isolation off campus', key: 'wpi_covid_isolation_off_campus', value: cachedData['isolation_off_campus']}),
            gaugeGenerator({help: 'Number of people in isolation on campus', key: 'wpi_covid_isolation_on_campus', value: cachedData['isolation_on_campus']}),
            gaugeGenerator({help: 'Number of people in quarantine off campus', key: 'wpi_covid_quarantine_off_campus', value: cachedData['quarantine_off_campus']}),
            gaugeGenerator({help: 'Number of people in quarantine on campus', key: 'wpi_covid_quarantine_on_campus', value: cachedData['quarantine_on_campus']}),
        ].join('');
        // console.log(output);
        res.send(output);
    } catch (e) {
        console.warn(e);
        res.status(500);
        res.send(e);
    }
});

// If we get a POST to /update, update the cached response
app.post('/update', async (req, res) => {
    res.type('json');
    try {
        console.log('Cache Miss!');
        await updateCache();
        res.setHeader('Server-Timing', timingArrayToString(cacheTiming));
        console.log(`Server-Timing: ${timingArrayToString(cacheTiming)}`);

        res.setHeader('Age', Math.floor((Date.now() - originalCacheTime) / 1000));
        res.setHeader('Expires', new Date(cacheTime + CACHE_EXPIRE_TIME).toUTCString());
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200);
        res.send(cachedResponse);
    } catch (e) {
        console.warn(e);
        res.status(500);
        res.send({error: e});
    }
});

app.listen(80, () => {
    console.log('Listening on port 80');
});

async function updateCache() {
    const oldResponse = cachedResponse;
    cachedResponse = JSON.stringify(
        cachedData = parseData(
            await loadData()
        )
    );
    cacheTime = Date.now();
    if (oldResponse !== cachedResponse) {
        console.log('Cache Updated!');
        originalCacheTime = cacheTime;
    }
}

async function promiseTimeout <T> (ms: number, rejectReason: string, promise: Promise<T>): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                reject(rejectReason);
            }, ms);
        })
    ]);
}

function timingArrayToString(timing: {metric?: string, desc?: string, time?: number}[]) {
    let output = '';

    timing.forEach(({metric, desc, time}, i) => {
        if (metric) {
            output += `${i ? ', ' : ''}${metric}`;
        }
        if (desc) {
            output += `;desc="${desc.replace(/"/gi, '\\"')}"`;
        }
        if (time != undefined) {
            output += `;dur=${time}`;
        }
    });
    return output;
}

function gaugeGenerator({help, key, labels, value}: { help?: string; key: string; labels?:{[key: string]:string}, value: number; }) {
    let output = '';
    if (help) {
        output += `# HELP ${key} ${help}\n`;
    }
    output += `# TYPE ${key} gauge\n`;
    output += `${key}${labels?'{':''}`;
    if (labels) {
        Object.keys(labels).forEach((label, i, a) => {
            output += `${label}="${labels[label]}"${a.length != 1 && i != a.length - 1 ? ',' : ''}`;
        });
    }
    output += `${labels?'}':''} ${value}\n`;
    return output;
}

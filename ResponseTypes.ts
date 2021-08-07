// Generated by https://quicktype.io

export interface SecondaryInfo {
    secondaryInfo: SecondaryInfoClass;
}

export interface SecondaryInfoClass {
    presModelMap: SecondaryInfoPresModelMap;
}

export interface SecondaryInfoPresModelMap {
    dataDictionary: DataDictionary;
    vizData:        VizData;
}

export interface DataDictionary {
    presModelHolder: DataDictionaryPresModelHolder;
}

export interface DataDictionaryPresModelHolder {
    genDataDictionaryPresModel: GenDataDictionaryPresModel;
}

export interface GenDataDictionaryPresModel {
    dataSegments: DataSegments;
}

export interface DataSegments {
    "0": The0;
}

export interface The0 {
    dataColumns: DataColumn[];
}

export interface DataColumn {
    dataType:   string;
    dataValues: number[] | string[];
}

export interface VizData {
    presModelHolder: VizDataPresModelHolder;
}

export interface VizDataPresModelHolder {
    genPresModelMapPresModel: GenPresModelMapPresModel;
}

export interface GenPresModelMapPresModel {
    presModelMap: { [key: string]: PresModelMapValue };
}

export interface PresModelMapValue {
    presModelHolder: PresModelMapPresModelHolder;
}

export interface PresModelMapPresModelHolder {
    genVizDataPresModel: GenVizDataPresModel;
}

export interface GenVizDataPresModel {
    vizColumns:        any[];
    paneColumnsData:   PaneColumnsData;
    highlightCaptions: any[];
    filterFields:      any[];
    ubertipData:       UbertipData;
    reflineFields:     any[];
    refLineTips:       any[];
}

export interface PaneColumnsData {
    vizDataColumns:  VizDataColumn[];
    paneColumnsList: PaneColumnsList[];
}

export interface PaneColumnsList {
    paneDescriptor: PaneDescriptor;
    vizPaneColumns: VizPaneColumn[];
}

export interface PaneDescriptor {
    paneDescrKey: PaneDescrKey;
    xFields:      string[];
    yFields:      string[];
    xIndex:       number;
    yIndex:       number;
}

export enum PaneDescrKey {
    F29089B5D4A0Ee7F = "f29089b5d4a0ee7f",
    The3772B9Da2Fa1B0B5 = "3772b9da2fa1b0b5",
    The6344701B2A6Cb0Ec = "6344701b2a6cb0ec",
}

export interface VizPaneColumn {
    tupleIds:         number[];
    valueIndices:     number[];
    aliasIndices:     number[];
    formatstrIndices: number[];
}

export interface VizDataColumn {
    fn:                   string;
    fnDisagg:             string;
    formatStrings:        string[];
    isAutoSelect:         boolean;
    paneIndices:          number[];
    columnIndices:        number[];
    localBaseColumnName?: string;
    baseColumnName?:      string;
    fieldCaption?:        string;
    datasourceCaption?:   DatasourceCaption;
    dataType?:            DataType;
    aggregation?:         Aggregation;
    fieldRole?:           FieldRole;
}

export enum Aggregation {
    Sum = "sum",
}

export enum DataType {
    Date = "date",
    Integer = "integer",
    Real = "real",
}

export enum DatasourceCaption {
    Federated16Wu4Pv14V8Mey0Zw9Hr60Tbhwwq = "federated.16wu4pv14v8mey0zw9hr60tbhwwq",
    Federated1B13Ewt0F0Gdp310Ykzyc1Lc96Y3 = "federated.1b13ewt0f0gdp310ykzyc1lc96y3",
}

export enum FieldRole {
    Dimension = "dimension",
    Measure = "measure",
}

export interface UbertipData {
    ubertipPaneDatas:    UbertipPaneData[];
    standardCommands:    Commands;
    multiselectCommands: Commands;
    fn:                  string;
}

export interface Commands {
    commandItems: CommandItem[];
}

export interface CommandItem {
    commandsType: CommandsType;
    name:         Name;
    telemetryId:  string;
    description?: Description;
    iconRes:      IconRes;
    command:      string;
}

export enum CommandsType {
    Item = "item",
}

export enum Description {
    GroupMembers = "Group Members",
    SortShowLast30DaysAscendingByTests = "Sort show last 30 days ascending by Tests",
    SortShowLast30DaysDescendingByTests = "Sort show last 30 days descending by Tests",
    ViewData = "View Data...",
}

export enum IconRes {
    EnUSTQRCEXCLUDE = ":/en_US/TQRC_EXCLUDE",
    EnUSTQRCKEEPONLY = ":/en_US/TQRC_KEEP_ONLY",
    EnUSTQRCMERGE = ":/en_US/TQRC_MERGE",
    EnUSTQRCSORTASCENDING = ":/en_US/TQRC_SORT_ASCENDING",
    EnUSTQRCSORTDESCENDING = ":/en_US/TQRC_SORT_DESCENDING",
    EnUSTQRCVIEWDATA = ":/en_US/TQRC_VIEWDATA",
}

export enum Name {
    Empty = "",
    Exclude = "Exclude",
    KeepOnly = "Keep Only",
}

export interface UbertipPaneData {
    htmlTooltip:         string;
    showButtons:         boolean;
    summaryField:        string;
    fieldVector:         any[];
    htmlTooltipModified: string;
    paneDescriptor?:     PaneDescriptor;
}
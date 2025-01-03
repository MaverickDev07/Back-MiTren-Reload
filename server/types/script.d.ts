import { EventEmitter } from 'events';
import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length';

interface TubeMappingItem {
    denomination: number;
    index: number;
}

interface CambioValor {
    valor: number;
    comando: number[];
}

interface Commands {
    BillEnables: number[];
    Status: number[];
    AcceptBill: number[];
    RejectBill: number[];
    InhibitBills: number[];
    DesinhibitBilletero: number[];
    BilleteroEnEspera: number[];
    Enable10: number[];
    Enable10_20: number[];
    Enable10_20_50: number[];
    Enable10_20_50_100: number[];
    Enable10_20_50_100_200: number[];
    EnableAll: number[];
    EnableMonedero: number[];
    InhibitMonedero: number[];
    TubeStatus: number[];
    PullMonedero: number[];
    Cambio10Ctvs: number[];
    Cambio20Ctvs: number[];
    Cambio50Ctvs: number[];
    Cambio1Bs: number[];
    Cambio1_50Bs: number[];
    Cambio2Bs: number[];
    Cambio2_50Bs: number[];
    Cambio3Bs: number[];
}

interface CoinMapping {
    [key: string]: number;
}

interface TubeStatusResponse {
    tubeStatus: {
        [key: number]: number;
    };
    total: number;
}

interface PaymentCompletedData {
    message: string;
    totalPaid: string;
    change: string | null;
}

interface TubeStatusEvent {
    total: number;
    acceptedBills: number[];
}

declare module './script' {
    export const eventEmitter: EventEmitter & {
        on(event: 'tubeStatus', listener: (data: TubeStatusEvent) => void): this;
        on(event: 'paymentCompleted', listener: (data: PaymentCompletedData) => void): this;
        once(event: 'tubeStatus', listener: (data: TubeStatusEvent) => void): this;
        once(event: 'paymentCompleted', listener: (data: PaymentCompletedData) => void): this;
    };
    
    export const COMMANDS: Commands;
    export const CAMBIO_VALORES: CambioValor[];
    export function requestAmount(amount: number): void;
    export function calculateChangeCommands(change: number): number[][];
    export function checkCoinTubes(): void;
    export function parseTubeStatus(hexResponse: string): TubeStatusResponse;
    export function evaluateBill(segments: string): number;
    export function evaluateCoin(hexResponse: string): number;
    export function sendCommand(port: SerialPort, command: number[]): void;
}
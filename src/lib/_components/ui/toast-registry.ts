import type { ToasterRef } from './toast-provider';

let toastShow: ToasterRef['show'] | null = null;
let toastDismiss: (() => void) | null = null;

export function setToastShow(fn: ToasterRef['show'] | null): void {
    toastShow = fn;
}

export function getToastShow(): ToasterRef['show'] | null {
    return toastShow;
}

export function setToastDismiss(fn: (() => void) | null): void {
    toastDismiss = fn;
}

export function getToastDismiss(): (() => void) | null {
    return toastDismiss;
}

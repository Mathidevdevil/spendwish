"use client";

let listeners: Array<(isOpen: boolean, initialData?: any) => void> = [];

export const transactionModal = {
  open: (data?: any) => {
    listeners.forEach((listener) => listener(true, data));
  },
  close: () => {
    listeners.forEach((listener) => listener(false, undefined));
  },
  subscribe: (listener: (isOpen: boolean, data?: any) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

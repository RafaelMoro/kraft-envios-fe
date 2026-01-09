import { KraftEnviosLocalStorage } from "../types/global.types";

const localStorageKey = process.env.NEXT_PUBLIC_LOCAL_STORAGE;

function createLocalStorage() {
  if (!localStorageKey) {
    throw new Error('Unable to get the local storage name from the env variable. Please check');
  }
  const emptyLocalStorageInfo = {};
  const stringifiedEmptyLocalStorage = JSON.stringify(emptyLocalStorageInfo);
  localStorage.setItem(localStorageKey, stringifiedEmptyLocalStorage);
}

function saveInfoToLocalStorage(localStorageInfo: object):void {
  if (!localStorageKey) {
    throw new Error('Unable to get the local storage name from the env variable. Please check');
  }
  const stringifiedLocalStorageInfo = JSON.stringify(localStorageInfo);
  localStorage.setItem(localStorageKey, stringifiedLocalStorageInfo);
}

export function getLocalStorageInfo() {
  if (!localStorageKey) {
    throw new Error('Unable to get the local storage name from the env variable. Please check');
  }

  let getLocalStorageValues: null | string;
  do {
    getLocalStorageValues = localStorage.getItem(localStorageKey);
    if (!getLocalStorageValues) {
      createLocalStorage();
    }
  } while (!getLocalStorageValues);

  const parsedLocalStorageInfo: KraftEnviosLocalStorage = JSON.parse(getLocalStorageValues);
  return parsedLocalStorageInfo;
}

export function addToLocalStorage({ newInfo, prop }: { newInfo: object, prop?: string }) {
  const localStorageInfo = getLocalStorageInfo();
  let newLocalStorage;
  if (prop) {
    newLocalStorage = {
      ...localStorageInfo,
      [prop]: newInfo,
    };
  } else {
    newLocalStorage = {
      ...localStorageInfo,
      ...newInfo,
    };
  }
  saveInfoToLocalStorage(newLocalStorage);
  return newLocalStorage;
}

export function removeFromLocalStorage({ prop }: { prop: keyof KraftEnviosLocalStorage }) {
  const localStorageInfo = getLocalStorageInfo();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [prop]: _, ...newLocalStorage } = localStorageInfo;
  saveInfoToLocalStorage(newLocalStorage);
}

export function resetLocalStorage() {
  saveInfoToLocalStorage({});
}
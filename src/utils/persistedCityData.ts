const CITY_DATA_KEY = "cityData";

export const getPersistedCityData = () => {
  const sessionValue =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(CITY_DATA_KEY)
      : null;

  if (sessionValue) {
    return sessionValue;
  }

  if (typeof localStorage !== "undefined") {
    return localStorage.getItem(CITY_DATA_KEY);
  }

  return null;
};

export const setPersistedCityData = (value: string) => {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(CITY_DATA_KEY, value);
  }

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(CITY_DATA_KEY, value);
  }
};

export const clearPersistedCityData = () => {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(CITY_DATA_KEY);
  }

  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(CITY_DATA_KEY);
  }
};

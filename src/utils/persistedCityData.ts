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
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(CITY_DATA_KEY, value);
    }
  } catch (error) {
    console.warn("Falha ao salvar snapshot da cidade em sessionStorage:", error);
  }

  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CITY_DATA_KEY, value);
    }
  } catch (error) {
    console.warn("Falha ao salvar snapshot da cidade em localStorage:", error);
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

'use client';
import { useState, ChangeEvent } from "react";
import axios from "axios";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface InputProps {
  value: string;
  classname?: string;
  filterr: 'house' | 'street' | 'country' | 'locality' | 'province';
  placeholder?: string;
  onChange: (value: string) => void;
}

// Интерфейс для данных от Яндекс Геокодера
interface GeocoderFeature {
  GeoObject: {
    metaDataProperty: {
      GeocoderMetaData: {
        kind: string;
        text: string;
      }
    }
  }
}

const AddressInput: React.FC<InputProps> = ({value, onChange, classname, filterr, placeholder}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const apiKey = 'af326049-6a46-4bf5-ba49-80588f6ffd5e';
      const response = await axios.get(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${query}&format=json`
      );
      const results = response.data.response.GeoObjectCollection.featureMember;

      const filteredResults = results
        .filter((item: GeocoderFeature) => item.GeoObject.metaDataProperty.GeocoderMetaData.kind === filterr)
        .map((item: GeocoderFeature) => item.GeoObject.metaDataProperty.GeocoderMetaData.text)
        .slice(0, 4);

      setSuggestions(filteredResults);
    } catch (error) {
      console.error("Ошибка получения данных:", error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);
    fetchSuggestions(value);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(`border p-2 ${suggestions.length > 0 && 'rounded-b-none'}`, classname)}
      />
      {suggestions.length > 0 && (
        <ul className="border-x border-b rounded-b-xl bg-white shadow-md absolute z-50">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => {
                onChange(suggestion);
                setSuggestions([]);
              }}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressInput;

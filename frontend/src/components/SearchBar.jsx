import React, { useState, useEffect } from 'react';
import { debounce } from '../utils/helpers';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search function
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      onSearch(searchTerm);
    }, 500);

    debouncedSearch();
  }, [searchTerm, onSearch]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Ara... (Ad, Soyad, Şirket, Bütçe, Adres, Şehir)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {searchTerm && (
        <button
          className="search-clear"
          onClick={() => setSearchTerm('')}
          title="Temizle"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBar;

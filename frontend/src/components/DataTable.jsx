import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { eventsAPI } from '../services/api';
import { getRowClassName, getErrorMessage } from '../utils/helpers';
import AddButton from './AddButton';
import EditModal from './EditModal';

// Default column order
const DEFAULT_COLUMN_ORDER = [
  'BUTCE',
  'GONDERIM_TURU',
  'AD',
  'SOYAD',
  'SIRKET',
  'UNVAN',
  'ADRES',
  'ULKE',
  'SEHIR',
  'ILCE',
  'SEMT',
  'POSTA_KODU',
  'MESAJ',
  'KARTVIZIT1',
  'KARTVIZIT2',
  'KARTVIZIT3',
  'KARTVIZIT4',
  'KARTVIZIT5'
];

// Column labels
const COLUMN_LABELS = {
  BUTCE: 'BÜTÇE',
  GONDERIM_TURU: 'GÖNDERİM TÜRÜ',
  AD: 'AD',
  SOYAD: 'SOYAD',
  SIRKET: 'ŞİRKET',
  UNVAN: 'ÜNVAN',
  ADRES: 'ADRES',
  ULKE: 'ÜLKE',
  SEHIR: 'ŞEHİR',
  ILCE: 'İLÇE',
  SEMT: 'SEMT',
  POSTA_KODU: 'POSTA KODU',
  MESAJ: 'MESAJ',
  KARTVIZIT1: 'KARTVİZİT 1',
  KARTVIZIT2: 'KARTVİZİT 2',
  KARTVIZIT3: 'KARTVİZİT 3',
  KARTVIZIT4: 'KARTVİZİT 4',
  KARTVIZIT5: 'KARTVİZİT 5'
};

// Sortable Table Header Component
const SortableTableHeader = ({ column, label, sortConfig, onSort, onSortColumn, getSortIcon }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`sortable ${isDragging ? 'dragging' : ''}`}
      {...attributes}
    >
      <div className="th-content">
        <div className="drag-handle" {...listeners} title="Sütunu taşımak için tutup sürükleyin">
          ⋮⋮
        </div>
        <span onClick={() => onSort(column)} className="sort-label">
          {label} <span className="sort-icon">{getSortIcon(column)}</span>
        </span>
      </div>
    </th>
  );
};

const DataTable = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('edit');

  // Load column order from localStorage or use default
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('columnOrder');
    return saved ? JSON.parse(saved) : DEFAULT_COLUMN_ORDER;
  });

  // Sorting state - Default: BUTCE A-Z
  const [sortConfig, setSortConfig] = useState({
    column: 'BUTCE',
    direction: 'asc'
  });

  // Column filters state - Initialize dynamically based on column order
  const [columnFilters, setColumnFilters] = useState(() => {
    const filters = {};
    DEFAULT_COLUMN_ORDER.forEach(col => {
      filters[col] = '';
    });
    return filters;
  });

  // Global BusinessCard filter - filters across all 5 card columns
  const [globalBusinessCardFilter, setGlobalBusinessCardFilter] = useState('');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle column drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Save to localStorage
        localStorage.setItem('columnOrder', JSON.stringify(newOrder));

        return newOrder;
      });
    }
  };

  // Reset column order to default
  const resetColumnOrder = () => {
    setColumnOrder(DEFAULT_COLUMN_ORDER);
    localStorage.setItem('columnOrder', JSON.stringify(DEFAULT_COLUMN_ORDER));
  };

  // Fetch all events (no pagination)
  const fetchEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await eventsAPI.getEvents();

      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Get unique values for each column (for filter dropdowns)
  const getUniqueValues = (columnName) => {
    const values = events
      .map(event => event[columnName])
      .filter(value => value !== null && value !== undefined && value !== '-' && value !== '');
    return [...new Set(values)].sort();
  };

  // Get all unique BusinessCard values across all 5 card columns
  const getAllBusinessCards = () => {
    const allCards = [];
    events.forEach(event => {
      [event.KARTVIZIT1, event.KARTVIZIT2, event.KARTVIZIT3, event.KARTVIZIT4, event.KARTVIZIT5].forEach(card => {
        if (card && card !== '-' && card !== null && card !== undefined) {
          allCards.push(card);
        }
      });
    });
    return [...new Set(allCards)].sort();
  };

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    // First apply filters
    let filtered = events.filter(event => {
      // Apply global BusinessCard filter across all 5 card columns
      if (globalBusinessCardFilter) {
        const hasMatchingCard = [
          event.KARTVIZIT1,
          event.KARTVIZIT2,
          event.KARTVIZIT3,
          event.KARTVIZIT4,
          event.KARTVIZIT5
        ].some(card =>
          card &&
          card !== '-' &&
          card.toString().toLowerCase().includes(globalBusinessCardFilter.toLowerCase())
        );

        if (!hasMatchingCard) return false;
      }

      // Apply individual column filters
      return Object.keys(columnFilters).every(column => {
        const filterValue = columnFilters[column];
        if (!filterValue) return true; // No filter applied

        const eventValue = event[column];
        if (eventValue === null || eventValue === undefined || eventValue === '-') return false;

        return eventValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });

    // Then apply sorting
    if (sortConfig.column && sortConfig.direction) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.column];
        const bValue = b[sortConfig.column];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined || aValue === '-') return 1;
        if (bValue === null || bValue === undefined || bValue === '-') return -1;

        // String comparison (case insensitive)
        const aStr = aValue.toString().toLowerCase();
        const bStr = bValue.toString().toLowerCase();

        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr, 'tr');
        } else {
          return bStr.localeCompare(aStr, 'tr');
        }
      });
    }

    return filtered;
  }, [events, columnFilters, sortConfig, globalBusinessCardFilter]);

  const handleFilterChange = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleSort = (column) => {
    setSortConfig(prev => {
      // Toggle: none -> asc -> desc -> none
      if (prev.column !== column) {
        return { column, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      return { column: null, direction: null };
    });
  };

  const getSortIcon = (column) => {
    if (sortConfig.column !== column) {
      return '⇅'; // Both arrows (not sorted)
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const clearAllFilters = () => {
    setColumnFilters({
      BUTCE: '',
      GONDERIM_TURU: '',
      AD: '',
      SOYAD: '',
      SIRKET: '',
      UNVAN: '',
      ADRES: '',
      ULKE: '',
      SEHIR: '',
      ILCE: '',
      SEMT: '',
      POSTA_KODU: '',
      MESAJ: '',
      KARTVIZIT1: '',
      KARTVIZIT2: '',
      KARTVIZIT3: '',
      KARTVIZIT4: '',
      KARTVIZIT5: ''
    });
    setGlobalBusinessCardFilter(''); // Clear global BusinessCard filter too
  };

  const handleRowDoubleClick = (event) => {
    setSelectedEvent(event);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedEvent(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    fetchEvents();
  };

  // Horizontal scroll control
  const tableWrapperRef = React.useRef(null);

  const scrollLeft = () => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(columnFilters).some(value => value !== '') || globalBusinessCardFilter !== '';

  return (
    <div className="data-table-container">
      <div className="table-header">
        <div className="table-title">
          <p className="table-subtitle">
            Toplam {events.length} kayıt
            {filteredEvents.length !== events.length && ` (Filtrelenmiş: ${filteredEvents.length})`}
          </p>
        </div>

        <div className="table-actions">
          <button
            className="btn-secondary"
            onClick={fetchEvents}
            disabled={loading}
            title="Listeyi yenile"
          >
            🔄 Yenile
          </button>
          {hasActiveFilters && (
            <button className="btn-secondary" onClick={clearAllFilters}>
              Filtreleri Temizle
            </button>
          )}
          <button
            className="btn-secondary"
            onClick={resetColumnOrder}
            title="Sütun sıralamasını varsayılana döndür"
          >
            ↻ Sütunları Sıfırla
          </button>
          <AddButton onClick={handleAddNew} />
        </div>
      </div>

      {/* Color Legend & Scroll Controls */}
      <div className="legend-scroll-container">
        <div className="color-legend">
          <div className="legend-item">
            <span className="legend-dot legend-new"></span>
            <span className="legend-text">Yeni Kayıt</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-modified"></span>
            <span className="legend-text">Değiştirilmiş</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-deleted"></span>
            <span className="legend-text">Silinmiş</span>
          </div>
        </div>

        <div className="scroll-controls">
          <select
            value={globalBusinessCardFilter}
            onChange={(e) => setGlobalBusinessCardFilter(e.target.value)}
            className="businesscard-global-filter"
            title="Tüm kartvizit sütunlarında ara"
          >
            <option value="">Tüm Kartvizitler</option>
            {getAllBusinessCards().map(card => (
              <option key={card} value={card}>
                {card}
              </option>
            ))}
          </select>
          <button onClick={scrollLeft} className="scroll-btn" title="Sola kaydır">
            ← Sola
          </button>
          <button onClick={scrollRight} className="scroll-btn" title="Sağa kaydır">
            Sağa →
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="table-wrapper" ref={tableWrapperRef}>
            <table className="data-table">
              <thead>
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  <tr>
                    {columnOrder.map((column) => (
                      <SortableTableHeader
                        key={column}
                        column={column}
                        label={COLUMN_LABELS[column]}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        getSortIcon={getSortIcon}
                      />
                    ))}
                  </tr>
                </SortableContext>
                {/* Filter row */}
                <tr className="filter-row">
                  {columnOrder.map(column => (
                    <th key={column}>
                      <div className="filter-container">
                        <select
                          value={columnFilters[column]}
                          onChange={(e) => handleFilterChange(column, e.target.value)}
                          className="column-filter-select"
                          title="Listeden seç"
                        >
                          <option value="">Tümü</option>
                          {getUniqueValues(column).map(value => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={columnFilters[column]}
                          onChange={(e) => handleFilterChange(column, e.target.value)}
                          className="column-filter-input"
                          placeholder="Ara..."
                          title="Serbest metin arama"
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={columnOrder.length} className="no-data">
                    {hasActiveFilters ? 'Filtre sonucu bulunamadı' : 'Kayıt bulunamadı'}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr
                    key={event.uzm_eventId}
                    className={getRowClassName(event.is_modified, event.is_deleted, event.uzm_contactid)}
                    onDoubleClick={() => handleRowDoubleClick(event)}
                    title="Düzenlemek için çift tıklayın"
                  >
                    {columnOrder.map((column) => (
                      <td
                        key={column}
                        className={(column === 'ADRES' || column === 'MESAJ') ? 'td-wrap' : ''}
                      >
                        {event[column] || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </DndContext>
      )}

      {isModalOpen && (
        <EditModal
          event={selectedEvent}
          mode={modalMode}
          onClose={handleModalClose}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default DataTable;

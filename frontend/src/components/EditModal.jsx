import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { eventsAPI, referenceAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

const EditModal = ({ event, mode, onClose, onSaveSuccess }) => {
  // Form state
  const [formData, setFormData] = useState({
    budgetId: '',
    nationality: '1',
    contactId: '',
    addressType: '3',
    address: '',
    country: '',
    city: '',
    county: '',
    state: '',
    postalCode: '',
    salutationId: '',
    businessCard1: '',
    businessCard2: '',
    businessCard3: '',
    businessCard4: '',
    businessCard5: '',
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    isDeleted: false
  });

  // Reference data
  const [budgets, setBudgets] = useState([]);
  const [salutations, setSalutations] = useState([]);
  const [businessCards, setBusinessCards] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [budgetsRes, salutationsRes, businessCardsRes] = await Promise.all([
          referenceAPI.getBudgets(),
          referenceAPI.getSalutations(),
          referenceAPI.getBusinessCards()
        ]);

        setBudgets(budgetsRes.data.data);
        setSalutations(salutationsRes.data.data);
        setBusinessCards(businessCardsRes.data.data);
      } catch (err) {
        setError('Referans verileri yüklenemedi');
        console.error(err);
      }
    };

    loadReferenceData();
  }, []);

  // Load event data if editing
  useEffect(() => {
    if (mode === 'edit' && event) {
      const loadEventData = async () => {
        try {
          const response = await eventsAPI.getEventById(event.uzm_eventId);
          const eventData = response.data.data;

          setFormData({
            budgetId: eventData.uzm_budgetid || '',
            nationality: String(eventData.uzm_nationality || '1'),
            contactId: eventData.uzm_contactid || '',
            addressType: String(eventData.uzm_addresstype || '3'),
            address: eventData.uzm_adress || '',
            country: eventData.uzm_CountryidName || '',
            city: eventData.uzm_city || '',
            county: eventData.uzm_county || '',
            state: eventData.uzm_businessstate || '',
            postalCode: eventData.uzm_zippostalcode || '',
            salutationId: eventData.uzm_salutationid || '',
            businessCard1: eventData.uzm_BusinessCard1 || '',
            businessCard2: eventData.uzm_BusinessCard2 || '',
            businessCard3: eventData.uzm_BusinessCard3 || '',
            businessCard4: eventData.uzm_BusinessCard4 || '',
            businessCard5: eventData.uzm_BusinessCard5 || '',
            firstName: eventData.FirstName || '',
            lastName: eventData.LastName || '',
            company: eventData.Company || '',
            jobTitle: eventData.JobTitle || '',
            isDeleted: eventData.is_deleted || false
          });
        } catch (err) {
          setError(getErrorMessage(err));
        }
      };

      loadEventData();
    }
  }, [event, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.budgetId) {
      errors.budgetId = 'BÜTÇE zorunludur';
    }

    if (!formData.nationality) {
      errors.nationality = 'GÖNDERİM TÜRÜ zorunludur';
    }

    if (!formData.firstName) {
      errors.firstName = 'AD zorunludur';
    }

    if (!formData.lastName) {
      errors.lastName = 'SOYAD zorunludur';
    }

    if (!formData.addressType) {
      errors.addressType = 'ADRES TİPİ zorunludur';
    }

    if (!formData.address) {
      errors.address = 'ADRES zorunludur';
    }

    if (!formData.country) {
      errors.country = 'ÜLKE zorunludur';
    }

    if (!formData.city) {
      errors.city = 'ŞEHİR zorunludur';
    }

    if (!formData.county) {
      errors.county = 'İLÇE zorunludur';
    }

    if (!formData.jobTitle) {
      errors.jobTitle = 'ÜNVAN zorunludur';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      setError('Lütfen zorunlu alanları doldurun');
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'create') {
        await eventsAPI.createEvent(formData);
        toast.success('Kayıt başarıyla eklendi!');
      } else {
        await eventsAPI.updateEvent(event.uzm_eventId, formData);
        toast.success('Kayıt başarıyla güncellendi!');
      }

      onSaveSuccess();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Yeni Kayıt Ekle' : 'Kaydı Düzenle'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="eventForm">
            {/* Sil Checkbox - Only in edit mode */}
            {mode === 'edit' && (
              <div className="form-group delete-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="isDeleted"
                    checked={formData.isDeleted}
                    onChange={handleChange}
                  />
                  <span className="delete-label">Sil (Soft Delete)</span>
                </label>
              </div>
            )}

            {/* BÜTÇE - Required */}
            <div className="form-group">
              <label htmlFor="budgetId">
                BÜTÇE <span className="required">*</span>
              </label>
              <select
                id="budgetId"
                name="budgetId"
                value={formData.budgetId}
                onChange={handleChange}
                className={validationErrors.budgetId ? 'error' : ''}
                disabled={loading}
                required
              >
                <option value="">Seçiniz...</option>
                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name}
                  </option>
                ))}
              </select>
              {validationErrors.budgetId && (
                <span className="error-text">{validationErrors.budgetId}</span>
              )}
            </div>

            {/* GÖNDERİM TÜRÜ - Required */}
            <div className="form-group">
              <label htmlFor="nationality">
                GÖNDERİM TÜRÜ <span className="required">*</span>
              </label>
              <select
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className={validationErrors.nationality ? 'error' : ''}
                disabled={loading}
                required
              >
                <option value="1">YURTİÇİ</option>
                <option value="2">YURTDIŞI</option>
              </select>
              {validationErrors.nationality && (
                <span className="error-text">{validationErrors.nationality}</span>
              )}
            </div>

            {/* AD - Required */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  AD <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={validationErrors.firstName ? 'error' : ''}
                  disabled={loading}
                  placeholder="Ad"
                  required
                />
                {validationErrors.firstName && (
                  <span className="error-text">{validationErrors.firstName}</span>
                )}
              </div>

              {/* SOYAD - Required */}
              <div className="form-group">
                <label htmlFor="lastName">
                  SOYAD <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={validationErrors.lastName ? 'error' : ''}
                  disabled={loading}
                  placeholder="Soyad"
                  required
                />
                {validationErrors.lastName && (
                  <span className="error-text">{validationErrors.lastName}</span>
                )}
              </div>
            </div>

            {/* ADRES TİPİ - Required */}
            <div className="form-group">
              <label htmlFor="addressType">
                ADRES TİPİ <span className="required">*</span>
              </label>
              <select
                id="addressType"
                name="addressType"
                value={formData.addressType}
                onChange={handleChange}
                className={validationErrors.addressType ? 'error' : ''}
                disabled={loading}
                required
              >
                <option value="1">İş Adres</option>
                <option value="2">Ev Adres</option>
                <option value="3">Özel Adres</option>
              </select>
              {validationErrors.addressType && (
                <span className="error-text">{validationErrors.addressType}</span>
              )}
            </div>

            {/* ADRES - Required */}
            <div className="form-group">
              <label htmlFor="address">
                ADRES <span className="required">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={validationErrors.address ? 'error' : ''}
                rows="3"
                disabled={loading}
                placeholder="Adres giriniz..."
                required
              />
              {validationErrors.address && (
                <span className="error-text">{validationErrors.address}</span>
              )}
            </div>

            {/* ÜLKE - Required */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">
                  ÜLKE <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={validationErrors.country ? 'error' : ''}
                  disabled={loading}
                  placeholder="Ülke"
                  required
                />
                {validationErrors.country && (
                  <span className="error-text">{validationErrors.country}</span>
                )}
              </div>

              {/* ŞEHİR - Required */}
              <div className="form-group">
                <label htmlFor="city">
                  ŞEHİR <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={validationErrors.city ? 'error' : ''}
                  disabled={loading}
                  placeholder="Şehir"
                  required
                />
                {validationErrors.city && (
                  <span className="error-text">{validationErrors.city}</span>
                )}
              </div>
            </div>

            {/* İLÇE - Required */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="county">
                  İLÇE <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  className={validationErrors.county ? 'error' : ''}
                  disabled={loading}
                  placeholder="İlçe"
                  required
                />
                {validationErrors.county && (
                  <span className="error-text">{validationErrors.county}</span>
                )}
              </div>

              {/* SEMT - Optional */}
              <div className="form-group">
                <label htmlFor="state">SEMT</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Semt"
                />
              </div>
            </div>

            {/* POSTA KODU - Optional */}
            <div className="form-group">
              <label htmlFor="postalCode">POSTA KODU</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                disabled={loading}
                placeholder="Posta Kodu"
              />
            </div>

            {/* ŞİRKET - Optional */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">ŞİRKET</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Şirket"
                />
              </div>

              {/* ÜNVAN - Required */}
              <div className="form-group">
                <label htmlFor="jobTitle">
                  ÜNVAN <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className={validationErrors.jobTitle ? 'error' : ''}
                  disabled={loading}
                  placeholder="Ünvan"
                  required
                />
                {validationErrors.jobTitle && (
                  <span className="error-text">{validationErrors.jobTitle}</span>
                )}
              </div>
            </div>

            {/* MESAJ - Optional */}
            <div className="form-group">
              <label htmlFor="salutationId">MESAJ</label>
              <select
                id="salutationId"
                name="salutationId"
                value={formData.salutationId}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Seçiniz...</option>
                {salutations.map((salutation) => (
                  <option key={salutation.id} value={salutation.id}>
                    {salutation.name}
                  </option>
                ))}
              </select>
            </div>

            {/* KARTVİZİTLER - Optional (En altta) */}
            <div className="form-group">
              <label htmlFor="businessCard1">KARTVİZİT 1</label>
              <select
                id="businessCard1"
                name="businessCard1"
                value={formData.businessCard1}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Seçiniz...</option>
                {businessCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="businessCard2">KARTVİZİT 2</label>
              <select
                id="businessCard2"
                name="businessCard2"
                value={formData.businessCard2}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Seçiniz...</option>
                {businessCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="businessCard3">KARTVİZİT 3</label>
              <select
                id="businessCard3"
                name="businessCard3"
                value={formData.businessCard3}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Seçiniz...</option>
                {businessCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="businessCard4">KARTVİZİT 4</label>
              <select
                id="businessCard4"
                name="businessCard4"
                value={formData.businessCard4}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Seçiniz...</option>
                {businessCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="businessCard5">KARTVİZİT 5</label>
              <select
                id="businessCard5"
                name="businessCard5"
                value={formData.businessCard5}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Seçiniz...</option>
                {businessCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            form="eventForm"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

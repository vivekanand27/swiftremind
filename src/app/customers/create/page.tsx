"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { HiOutlineUser, HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin, HiOutlineBuildingOffice2, HiOutlineDocumentText, HiOutlineCurrencyRupee, HiOutlineCalendar, HiOutlineShieldCheck, HiOutlineBell } from "react-icons/hi2";
import { useUser } from "@/hooks/UserContext";

const AddCustomerPage = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [emailError, setEmailError] = useState("");
  const [organisations, setOrganisations] = useState([]);

  useEffect(() => {
    const fetchOrganisations = async () => {
      if (user?.role === 'superadmin') {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          const res = await axios.get('/api/organisations', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOrganisations(res.data.organisations || []);
        } catch (err) {
          toast.error('Failed to fetch organisations');
        }
      }
    };
    fetchOrganisations();
  }, [user]);
  
  const [form, setForm] = useState({
    // Basic Information
    name: '',
    phone: '',
    email: '',
    address: '',
    businessName: '',
    gstNumber: '',
    alternatePhone: '',
    notes: '',
    
    // Financial Information
    pendingAmount: '',
    currency: 'INR',
    paymentTerms: 'Net 30',
    creditLimit: '',
    dueDate: '',
    
    // Customer Classification
    customerType: 'Regular',
    paymentStatus: 'Current',
    riskLevel: 'Low',
    
    // Reminder Settings
    reminderFrequency: 'Weekly',
    preferredContactMethod: 'Email',
    autoReminder: true,
    // Organisation (for superadmin only)
    organisationId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      // Phone number validation - limit to 10 digits
      if (name === 'phone' || name === 'alternatePhone') {
        const numericValue = value.replace(/\D/g, ''); // Remove non-digits
        if (numericValue.length <= 10) {
          setForm(prev => ({ ...prev, [name]: numericValue }));
        }
      } else {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Customer name is required");
      return false;
    }
    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (form.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }
    if (form.alternatePhone && form.alternatePhone.length !== 10) {
      toast.error("Alternate phone number must be exactly 10 digits");
      return false;
    }
    if (form.email && !isValidEmail(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (form.pendingAmount && parseFloat(form.pendingAmount) < 0) {
      toast.error("Pending amount cannot be negative");
      return false;
    }
    if (form.creditLimit && parseFloat(form.creditLimit) < 0) {
      toast.error("Credit limit cannot be negative");
      return false;
    }
    // OrganisationId required for superadmin
    if (user?.role === 'superadmin' && !form.organisationId) {
      toast.error("Please select an organisation");
      return false;
    }
    return true;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Per-field validation
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Customer name is required';
        break;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (value.length !== 10) return 'Phone number must be exactly 10 digits';
        break;
      case 'alternatePhone':
        if (value && value.length !== 10) return 'Alternate phone number must be exactly 10 digits';
        break;
      case 'email':
        if (value && !isValidEmail(value)) return 'Please enter a valid email address';
        break;
      case 'pendingAmount':
        if (value && parseFloat(value) < 0) return 'Pending amount cannot be negative';
        break;
      case 'creditLimit':
        if (value && parseFloat(value) < 0) return 'Credit limit cannot be negative';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleEmailBlur = () => {
    if (form.email && !isValidEmail(form.email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // Prepare payload for API
      const payload: any = {
        ...form,
        pendingAmount: form.pendingAmount ? parseFloat(form.pendingAmount) : 0,
        creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : 0,
        dueDate: form.dueDate || undefined,
      };
      // If not superadmin, remove organisationId from payload
      if (user?.role !== 'superadmin') {
        delete payload.organisationId;
      }
      await axios.post('/api/customers', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Customer added successfully');
      router.push('/customers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: HiOutlineUser },
    { id: "financial", label: "Financial", icon: HiOutlineCurrencyRupee },
    { id: "classification", label: "Classification", icon: HiOutlineShieldCheck },
    { id: "reminders", label: "Reminders", icon: HiOutlineBell }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Add New Customer</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Tab */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineUser className="inline mr-2" />
                Customer Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter customer name"
                required
              />
              {errors.name && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errors.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlinePhone className="inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter phone number"
                required
              />
              {errors.phone && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errors.phone}</div>
              )}
            </div>

            <div>
                             <label className="block text-sm font-bold text-gray-900 mb-2">
                 <HiOutlineEnvelope className="inline mr-2" />
                 Email Address
               </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter email address"
              />
              {emailError && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{emailError}</div>
              )}
              {errors.email && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errors.email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlinePhone className="inline mr-2" />
                Alternate Phone
              </label>
              <input
                type="tel"
                name="alternatePhone"
                value={form.alternatePhone}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter alternate phone number"
              />
              {errors.alternatePhone && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errors.alternatePhone}</div>
              )}
            </div>

            <div>
                             <label className="block text-sm font-bold text-gray-900 mb-2">
                 <HiOutlineBuildingOffice2 className="inline mr-2" />
                 Business Name
               </label>
              <input
                type="text"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineDocumentText className="inline mr-2" />
                GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter GST number"
              />
            </div>

            <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-gray-900 mb-2">
                 <HiOutlineMapPin className="inline mr-2" />
                 Address
               </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineDocumentText className="inline mr-2" />
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter notes"
              />
            </div>
            {/* Organisation ID field for superadmin only */}
            {user?.role === 'superadmin' && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Organisation
                </label>
                <select
                  name="organisationId"
                  value={form.organisationId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                  required
                >
                  <option value="">Select organisation</option>
                  {organisations.map((org: any) => (
                    <option key={org._id} value={org._id}>{org.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Financial Information Tab */}
        {activeTab === "financial" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineCurrencyRupee className="inline mr-2" />
                Pending Amount
              </label>
              <input
                type="number"
                name="pendingAmount"
                value={form.pendingAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter pending amount"
              />
              {errors.pendingAmount && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errors.pendingAmount}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineCurrencyRupee className="inline mr-2" />
                Credit Limit
              </label>
              <input
                type="number"
                name="creditLimit"
                value={form.creditLimit}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter credit limit"
              />
              {errors.creditLimit && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errors.creditLimit}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineCurrencyRupee className="inline mr-2" />
                Currency
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineDocumentText className="inline mr-2" />
                Payment Terms
              </label>
              <select
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Net 90">Net 90</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Advance Payment">Advance Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineCalendar className="inline mr-2" />
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
                placeholder="Enter due date"
              />
            </div>
          </div>
        )}

        {/* Customer Classification Tab */}
        {activeTab === "classification" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineShieldCheck className="inline mr-2" />
                Customer Type
              </label>
              <select
                name="customerType"
                value={form.customerType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Retail">Retail</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineShieldCheck className="inline mr-2" />
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
              >
                <option value="Current">Current</option>
                <option value="Overdue">Overdue</option>
                <option value="Paid">Paid</option>
                <option value="Delinquent">Delinquent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineShieldCheck className="inline mr-2" />
                Risk Level
              </label>
              <select
                name="riskLevel"
                value={form.riskLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        )}

        {/* Reminder Settings Tab */}
        {activeTab === "reminders" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineBell className="inline mr-2" />
                Reminder Frequency
              </label>
              <select
                name="reminderFrequency"
                value={form.reminderFrequency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Never">Never</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                <HiOutlineBell className="inline mr-2" />
                Preferred Contact Method
              </label>
              <select
                name="preferredContactMethod"
                value={form.preferredContactMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 font-semibold text-base placeholder-gray-400"
              >
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Phone">Phone</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <input
                  type="checkbox"
                  name="autoReminder"
                  checked={form.autoReminder}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Enable Automatic Reminders
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Automatically send payment reminders based on the selected frequency
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1].id);
              }
            }}
            disabled={activeTab === "basic"}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-3">
            {activeTab !== "reminders" ? (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id);
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Customer"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCustomerPage; 
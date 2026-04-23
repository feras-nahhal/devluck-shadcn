"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, X } from "lucide-react";



interface UniversityAddress {
  id?: string;
  name: string;
  tag: string;
  address: string;
  phoneNumber: string;
}

interface AddressModalProps {
  address?: UniversityAddress | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UniversityAddress) => void;
}


type MultiInputListProps = {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
};

const MultiInputList: React.FC<MultiInputListProps> = ({
  label,
  items,
  setItems,
}) => {
  const [currentValue, setCurrentValue] = useState("");

  const addItem = () => {
    const trimmed = currentValue.trim();

    if (!trimmed) return;

    // prevent duplicates
    if (items.includes(trimmed)) {
      setCurrentValue("");
      return;
    }

    setItems([...items, trimmed]);
    setCurrentValue("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* Input + Add */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <ParallelogramInput
            label={label}
            placeholder={`Add ${label.toLowerCase()}`}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
     
            type="text"
          />
        </div>

        <button
          type="button"
          onClick={addItem}
          disabled={!currentValue.trim()}
          className="
            h-[48px]
            px-5
            rounded-lg
            bg-[#FFEB9C]
            font-semibold
            text-black
            shadow-sm
            skew-x-[-12deg]
            hover:skew-x-[-14deg]
            cursor-pointer
            disabled:cursor-not-allowed
            hover:bg-[#FFE066]
            hover:scale-105
            active:scale-95
            transition-all duration-200
          "
        >
          <span className="block skew-x-[12deg] text-[var(--color-text-primary)]">
            Add
          </span>
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 min-h-[36px]">

        {items.length === 0 && (
          <span className=" text-sm italic text-[var(--color-text-primary)]">
            No {label.toLowerCase()} added yet
          </span>
        )}

        {items.map((item, index) => (
          <div
            key={index}
            className="
              group
              flex items-center gap-2
              bg-[#FFF4C2]
              border border-[#FFE066]
              px-3 py-1.5
              rounded-full
              text-sm
              font-medium
              shadow-sm
              transition-all duration-200 text-[var(--color-text-primary)]
            "
          >
            {item}

            <button
              type="button"
              onClick={() => removeItem(index)}
              className="
                flex items-center justify-center
                w-5 h-5
                rounded-full
                text-red-500
                opacity-70
                group-hover:opacity-100
                bg-red-200
                hover:text-red-600
                transition-all duration-150 
              "
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        ))}

      </div>
    </div>
  );
};

type ParallelogramSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

const ParallelogramSelect = ({
  label,
  placeholder,
  value,
  options,
  onChange,
}: ParallelogramSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full h-[48px] group">
      {/* Label */}
      <label
        className="absolute -top-2 left-5 h-[18px] px-3 bg-[#FFEB9C] text-[#1E1E1E] text-xs select-none flex items-center skew-x-[-12deg] z-30"
        style={{ borderRadius: "6px" }}
      >
        <span className="skew-x-[12deg] text-[var(--color-text-primary)]">{label}</span>
      </label>

      {/* Field */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative w-full h-full outline-none cursor-pointer"
      >
        <div
          className={`
            h-full w-full border border-[var(--color-text-primary)] rounded-[12px]
            transition-all duration-200
            group-hover:border-[#FFD700]
            group-focus-within:border-[#FFD700]
            group-focus-within:shadow-[0_0_0_2px_rgba(255,215,0,0.25)]
            ${open ? "border-[#FFD700] shadow-[0_0_0_2px_rgba(255,215,0,0.25)]" : ""}
          `}
          style={{ transform: "skewX(-15deg)" }}
        >
          <div
            className="h-full flex items-center justify-between px-5"
            style={{ transform: "skewX(15deg)" }}
          >
            <span
              className={`text-[14px] ${value ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                }`}
            >
              {value || placeholder}
            </span>

            {/* Arrow */}
            <svg
              width="10"
              height="5"
              viewBox="0 0 10 5"
              fill="none"
              className={`
                transition-transform duration-300 ease-in-out
                ${open ? "rotate-180" : "rotate-0"}
              `}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.66752 4.66752C4.51175 4.66782 4.36079 4.61357 4.24085 4.51418L0.24085 1.18085C-0.0426562 0.945208 -0.0814581 0.524356 0.154183 0.24085C0.389825 -0.0426562 0.810677 -0.0814581 1.09418 0.154183L4.66752 3.14085L8.24085 0.26085C8.37858 0.149003 8.55521 0.0966707 8.73164 0.11544C8.90807 0.134209 9.06973 0.22253 9.18085 0.36085C9.30427 0.499423 9.36435 0.683168 9.34664 0.867889C9.32893 1.05261 9.23502 1.22159 9.08752 1.33418L5.08752 4.55418C4.96413 4.63786 4.81625 4.67776 4.66752 4.66752Z" fill="var(--color-text-primary)" />
            </svg>

          </div>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-2 bg-[var(--color-card)]  rounded-[12px] z-40 shadow-md overflow-hidden"

        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`
                  px-5 py-2 text-sm cursor-pointer text-[var(--color-text-primary)]
                  ${value === option
                  ? "bg-[#FFEB9C] font-semibold"
                  : "hover:bg-[#FFEB9C]/60"
                }
                `}
            >
              {option}
            </div>
          ))}

        </div>
      )}
    </div>
  );
};




const ParallelogramInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
}) => (
  <div className="relative w-full h-[48px] group">
    <label
      className="absolute -top-2 left-5 h-[18px] px-3 bg-[#FFEB9C] text-[var(--color-text-primary)] text-xs font-normal select-none flex items-center skew-x-[-12deg] z-20"
      style={{ borderRadius: "6px" }}
    >
      <span className="skew-x-[12deg] text-[var(--color-text-primary)]">{label}</span>
    </label>
    <div className="overflow rounded-[12px] h-full w-full">
      <div
        className="h-full w-full border border-[var(--color-text-primary)]  transition-all duration-200 group-hover:border-[#FFD700] group-focus-within:border-[#FFD700]  group-focus-within:shadow-[0_0_0_2px_rgba(255,215,0,0.25)] "
        style={{ transform: "skewX(-15deg)", borderRadius: "12px", background: "transparent" }}
      >
        <div
          style={{
            transform: "skewX(15deg)",
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          {type === "textarea" ? (
            <textarea
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="bg-transparent outline-none w-full resize-none text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] h-full"
            />
          ) : (
            <input
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="bg-transparent outline-none w-full text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
            />
          )}
        </div>
      </div>
    </div>
  </div>
);

// Main payment Modal Component
const AddressModal: React.FC<AddressModalProps> = ({
  address,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UniversityAddress>({
    name: "",
    tag: "",
    address: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);

   useEffect(() => {
    if (address) {
      setFormData(address);
    } else {
      setFormData({ name: "", tag: "", address: "", phoneNumber: "" });
    }
  }, [address, isOpen]);


  const handleInputChange = (field: keyof UniversityAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
    e.preventDefault();
    }
    
    if (!formData.name || !formData.tag || !formData.address || !formData.phoneNumber) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

    return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/35 backdrop-blur-l" onClick={onClose} />

        {/* Modal */}
        <div
        className="relative w-full max-w-[640px] max-h-[95vh] flex flex-col isolate rounded-4xl bg-[rgba(255,255,255,0.04)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div
          className="flex items-center justify-between w-full h-[85px] px-4 flex-shrink-0 bg-[url('/cards/cardHeader.svg')] dark:bg-[url('/cards/cardHeaderDark.svg')]"
          style={{
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
        {/* Desktop title */}
        <h2
          className="hidden sm:flex absolute items-center text-[var(--color-text-primary)]"
          style={{
            width: "350px",
            height: "36px",
            left: "117.37px",
            top: "21.79px",
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            lineHeight: "36px",
          }}
        >
          {address ? "Edit Address" : "Add Address"}
        </h2>

        {/* Mobile title */}
        <h2 className="flex sm:hidden w-full text-center text-[var(--color-text-primary)] font-bold text-xl">
          {address ? "Edit Address" : "Add Address"}
        </h2>
        </div>

        {/* Form - scrollable */}
        <form
            className="flex-1 flex flex-col gap-4 p-4  bg-[var(--color-card)] "
            onSubmit={handleSubmit}
        >
             <ParallelogramInput
            label="University Name"
            placeholder="Enter university name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          <ParallelogramInput
            label="Tag"
            placeholder="Home / Campus / Office"
            value={formData.tag}
            onChange={(e) => handleInputChange("tag", e.target.value)}
          />
          <ParallelogramInput
            label="Address"
            placeholder="Full address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
          <ParallelogramInput
            label="Phone Number"
            placeholder="+1 617-253-1000"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          />
            
        </form>

        {/* Footer */}
        <div
          className="flex items-center justify-center w-full h-[90px] flex-shrink-0 bg-[url('/cards/cardFooter.svg')] dark:bg-[url('/cards/cardFooterDark.svg')] bg-cover bg-center px-4"
        >
            <div className="flex w-[400px] justify-between">
            <button
                onClick={onClose}
                className="relative w-[100px] h-[40px] skew-x-[-12deg] bg-transparent border border-[var(--color-text-primary)] flex items-center justify-center overflow-hidden rounded-lg transform transition-all duration-200 hover:scale-105 cursor-pointer"
            >
                <span className="skew-x-[12deg] font-bold text-[var(--color-text-primary)]">Cancel</span>
            </button>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="relative w-[100px] h-[40px] skew-x-[-12deg] bg-[#FFEB9C] flex items-center justify-center overflow-hidden rounded-md hover:bg-[#FFE066] transition duration-200 hover:scale-105 cursor-pointer"
            >
                <span className="skew-x-[12deg] font-bold text-[var(--color-text-primary)]">
                {loading ? <Loader2 className="animate-spin" /> : address ? "Update" : "Confirm"}
                </span>
            </button>
            </div>
        </div>
        </div>
    </div>
    );
};

export default AddressModal;

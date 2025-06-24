import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Calendar, X } from 'lucide-react-native';

interface DatePickerProps {
  visible: boolean;
  date: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
}

export default function DatePicker({ 
  visible, 
  date, 
  onDateChange, 
  onClose 
}: DatePickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const selectedYear = date.getFullYear();
  const selectedMonth = date.getMonth();
  const selectedDay = date.getDate();
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDateChange = (year?: number, month?: number, day?: number) => {
    const newDate = new Date(
      year ?? selectedYear,
      month ?? selectedMonth,
      day ?? selectedDay
    );
    onDateChange(newDate);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Calendar size={20} color="#722F37" />
              <Text style={styles.modalTitle}>Select Date</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#722F37" />
            </TouchableOpacity>
          </View>

          <View style={styles.datePickerContainer}>
            {/* Year Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Year</Text>
              <View style={styles.optionsContainer}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.optionButton,
                      selectedYear === year && styles.optionButtonSelected
                    ]}
                    onPress={() => handleDateChange(year)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedYear === year && styles.optionTextSelected
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Month Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Month</Text>
              <View style={styles.optionsContainer}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.optionButton,
                      selectedMonth === index && styles.optionButtonSelected
                    ]}
                    onPress={() => handleDateChange(undefined, index)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedMonth === index && styles.optionTextSelected
                    ]}>
                      {month.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Day Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Day</Text>
              <View style={styles.optionsContainer}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.optionButton,
                      selectedDay === day && styles.optionButtonSelected
                    ]}
                    onPress={() => handleDateChange(undefined, undefined, day)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedDay === day && styles.optionTextSelected
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateLabel}>Selected Date:</Text>
            <Text style={styles.selectedDateText}>
              {date.toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
    color: '#722F37',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  datePickerContainer: {
    padding: 20,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: '#722F37',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
    minWidth: 50,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#722F37',
    borderColor: '#722F37',
  },
  optionText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: '#722F37',
  },
  optionTextSelected: {
    color: 'white',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  selectedDateLabel: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    color: '#8B5A5F',
    marginRight: 8,
  },
  selectedDateText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: '#722F37',
  },
  confirmButton: {
    backgroundColor: '#722F37',
    margin: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});
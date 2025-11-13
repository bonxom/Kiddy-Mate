import { DayPicker, type DayPickerSingleProps } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface CalendarProps extends Omit<DayPickerSingleProps, 'mode'> {
  className?: string;
}

const Calendar = ({ className = '', ...props }: CalendarProps) => {
  return (
    <div className={`bg-white rounded-lg ${className}`}>
      <DayPicker
        mode="single"
        showOutsideDays
        className="rdp"
        classNames={{
          months: 'flex flex-col',
          month: 'space-y-3',
          caption: 'flex justify-between items-center px-2 py-2 relative mb-2',
          caption_label: 'text-xs font-semibold text-gray-700',
          nav: 'flex items-center gap-1',
          nav_button: 'h-6 w-6 bg-transparent p-0 opacity-70 hover:opacity-100 rounded hover:bg-gray-100 inline-flex items-center justify-center',
          nav_button_previous: 'order-first',
          nav_button_next: 'order-last',
          table: 'w-full border-collapse',
          head_row: 'flex',
          head_cell: 'text-gray-500 rounded w-7 font-normal text-[0.65rem]',
          row: 'flex w-full mt-1',
          cell: 'text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md focus-within:relative focus-within:z-20',
          day: 'h-7 w-7 p-0 font-normal text-xs aria-selected:opacity-100 hover:bg-gray-100 rounded-md',
          day_selected: 'bg-accent text-white hover:bg-accent hover:text-white focus:bg-accent focus:text-white',
          day_today: 'bg-gray-100 text-gray-900 font-semibold',
          day_outside: 'text-gray-400 opacity-50',
          day_disabled: 'text-gray-400 opacity-50 cursor-not-allowed',
          day_hidden: 'invisible',
        }}
        {...props}
      />
    </div>
  );
};

export default Calendar;

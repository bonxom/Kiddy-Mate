import { DayPicker, type DayPickerSingleProps } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface CalendarProps extends Omit<DayPickerSingleProps, 'mode'> {
  className?: string;
}

const Calendar = ({ className = '', ...props }: CalendarProps) => {
  return (
    <div
      className={`bg-white rounded-lg ${className} overflow-hidden w-full`}
      style={{ maxWidth: '100%' }}
    >
      <DayPicker
        mode="single"
        showOutsideDays
        className="rdp w-full"
        classNames={{
          months: 'flex flex-col',
          month: 'space-y-2',
          caption: 'flex justify-start items-center px-1 py-1.5 relative mb-2 gap-2',
          caption_label: 'text-[1rem] font-semibold text-gray-700 flex-shrink-0',
          
          nav: 'flex items-center gap-0.5 ml-auto hidden',
          nav_button: 'inline-flex h-5 w-5 bg-transparent p-0 opacity-60 hover:opacity-100 rounded hover:bg-gray-50 items-center justify-center text-xs',
          nav_button_previous: '',
          nav_button_next: '',

          table: 'w-full border-collapse',
          head_row: 'flex w-full justify-between',
          head_cell: 'text-gray-500 flex-1 text-center font-medium text-[0.6rem]',
          row: 'flex w-full justify-between mt-0.5',
          cell: 'flex-1 text-center text-[0.65rem] p-0 relative focus-within:relative focus-within:z-20',
          
          day: 'h-6 w-6 mx-auto p-0 font-normal text-[0.7rem] aria-selected:opacity-100 hover:bg-gray-100 rounded-md items-center justify-center',
          day_selected: 'bg-transparent text-blue-600 border-2 border-blue-500 font-semibold hover:bg-blue-50 focus:bg-blue-50',
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
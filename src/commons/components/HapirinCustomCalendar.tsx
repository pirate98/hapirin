import React, { useState, useMemo, useCallback } from 'react';
import moment, { Moment } from 'moment';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';

interface HapirinCustomCalendarProps {
  showDayHeading?: boolean;
  dayHeadings?: string[];
  dayCharing?: string[];
  enabledDaysOfTheWeek?: string[];
  startDate: string;
  numberOfDaysToShow: number;
  numberOfPreviousDaysToShow?: number;
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  isoWeek?: boolean;
  disablePreviousDays?: boolean;
  disableToday?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  headingContainerStyle?: StyleProp<ViewStyle>;
  headingStyle?: StyleProp<TextStyle>;
  sunDayheadingStyle?: StyleProp<TextStyle>;
  satDayheadingStyle?: StyleProp<TextStyle>;
  weekContainerStyle?: StyleProp<ViewStyle>;
  dayStyle?: StyleProp<ViewStyle>;
  activeDayStyle?: StyleProp<ViewStyle>;
  sunDayStyle?: StyleProp<ViewStyle>;
  satDayStyle?: StyleProp<ViewStyle>;
  disabledDayStyle?: StyleProp<ViewStyle>;
  selectedDayStyle?: StyleProp<ViewStyle>;
}

const HapirinCustomCalendar: React.FC<HapirinCustomCalendarProps> = ({
  showDayHeading = true,
  dayHeadings = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  dayCharing = [],
  enabledDaysOfTheWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  selectedDate: initialSelectedDate = moment().format('YYYY-MM-DD'),
  startDate,
  numberOfDaysToShow,
  numberOfPreviousDaysToShow = 0,
  onDateSelect,
  isoWeek = false,
  disablePreviousDays = true,
  disableToday = false,
  containerStyle,
  headingContainerStyle,
  headingStyle,
  sunDayheadingStyle,
  satDayheadingStyle,
  weekContainerStyle,
  dayStyle,
  activeDayStyle,
  sunDayStyle,
  satDayStyle,
  disabledDayStyle,
  selectedDayStyle,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate);

  const startOfWeek = isoWeek ? 'isoWeek' : 'week';

  const totalDays = (numberOfPreviousDaysToShow || 0) + numberOfDaysToShow;

  const actualStartDate = useMemo(() => moment(startDate).startOf(startOfWeek), [
    startDate,
    startOfWeek,
  ]);

  const changeTextColor = useCallback((crMonth: Moment, otherMonth: Moment) => {
    return {
      color: crMonth.format('M') === otherMonth.format('M') ? 'black' : 'gray',
      fontFamily: 'HuiFont',
    };
  }, []);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    onDateSelect(date);
  }, [onDateSelect]);

  const renderWeek = (weekIdx: number, actualStart: Moment, startDate: string) => {
    const days = dayHeadings.map((dow, dowIdx) => {
      const fullDate = actualStart.format('YYYY-MM-DD');
      const displayDate = actualStart.format('D');
      const dayIndex = actualStart.day();

      const isDisabled =
        !enabledDaysOfTheWeek.includes(dow) ||
        (disablePreviousDays && moment().diff(moment(fullDate)) > (disableToday ? 0 : 86400000));

      const containerStyles = [
        styles.dayOfWeek,
        dayStyle,
        isDisabled ? disabledDayStyle : activeDayStyle,
        dayIndex === 0 ? sunDayStyle : {},
        dayIndex === 6 ? satDayStyle : {},
        fullDate === selectedDate ? styles.dayOfWeekSelected : {},
        fullDate === selectedDate ? selectedDayStyle : {},
      ];

      const renderContent = (
        <>
          <Text style={changeTextColor(moment(startDate), actualStart)}>{displayDate}</Text>
          {dayCharing.includes(moment(fullDate).format('YYYYMMDD')) && (
            <FastImage
              style={styles.imagebuttonstyle}
              source={require('../../resources/images/3_1_8.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </>
      );

      const handlePress = () => {
        if (!isDisabled) {
          handleDateSelect(fullDate);
        }
      };

      actualStart.add(1, 'day');

      return (
        <TouchableOpacity
          key={`${weekIdx}-${dowIdx}`}
          style={containerStyles}
          onPress={handlePress}
        >
          <View>{renderContent}</View>
        </TouchableOpacity>
      );
    });

    return (
      <View key={weekIdx} style={[styles.dayOfWeekContainer, weekContainerStyle]}>
        {days}
      </View>
    );
  };

  const renderHeadings = () => {
    return dayHeadings.map((heading, idx) => {
      let styleOverride = headingStyle;
      if (idx === 0) styleOverride = sunDayheadingStyle;
      else if (idx === 6) styleOverride = satDayheadingStyle;

      return (
        <View key={`heading-${idx}`} style={styles.dowStyleContainer}>
          <Text style={[styles.dayOfWeekHeading, styleOverride]}>{heading}</Text>
        </View>
      );
    });
  };

  const renderCalendar = () => {
    const calendar = [];
    const tempStart = moment(actualStartDate);
    const weeks = Math.ceil(totalDays / dayHeadings.length);
    for (let i = 0; i < weeks; i++) {
      calendar.push(renderWeek(i, tempStart, startDate));
    }
    return calendar;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {showDayHeading && (
        <View style={[styles.dayOfWeekHeadingsContainer, headingContainerStyle]}>
          {renderHeadings()}
        </View>
      )}
      {renderCalendar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayOfWeekHeadingsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  dayOfWeekContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  dayOfWeekHeading: {
    flex: 1,
    textAlign: 'center',
    margin: 1,
    color: '#eee',
    backgroundColor: '#777',
    alignSelf: 'stretch',
  },
  dayOfWeek: {
    flex: 1,
    textAlign: 'right',
    margin: 1,
    color: '#aaa',
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#ddd',
  },
  dayOfWeekActive: {
    color: '#222',
    backgroundColor: 'lightblue',
  },
  dayOfWeekSelected: {
    backgroundColor: 'yellow',
  },
  dowStyleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  imagebuttonstyle: {
    width: '70%',
    height: '70%',
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  textDayStyle: {
    color: 'gray',
  },
});

export default HapirinCustomCalendar;

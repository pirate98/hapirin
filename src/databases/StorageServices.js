import realm from './Databases';

const USER_INFO_SCHEMA = 'UserInfo';
const USER_HABIT_SCHEMA = 'UserHabit';
const CHARING = 'Charing';

//get data from table user info
export const getUserInfo = () => {
  const userInfo = realm.objects(USER_INFO_SCHEMA);
  return Promise.resolve(userInfo);
};
export const insertUser = user => {
  const newUser = realm.objects(USER_INFO_SCHEMA);
  return new Promise((resolve, reject) => {
    realm.write(() => {
      realm.create(USER_INFO_SCHEMA, user);
      resolve(newUser);
    });
  });
};

export const updateUser = (user, callback) => {
  return new Promise((resolve, reject) => {
    try {
      realm.write(() => {
        realm.create(
          USER_INFO_SCHEMA,
          {
            ID: user.ID,
            UserId: user.UserId,
            PassWord: user.PassWord,
            Name: user.Name,
            Mrs: user.Mrs,
            Sex: user.Sex,
            Year: user.Year,
            DelFg: user.DelFg,
          },
          'modified',
        );
        // if(typeof callback === 'function') callback(false)
        resolve();
      });
    } catch (e) {
      reject(Error('error'));
    }
  });
};

//get data from table user habit
export const getUserHabit = () => {
  const userHabit = realm.objects(USER_HABIT_SCHEMA);
  return Promise.all(userHabit);
};

export const getUserHabitWithMode = mode => {
  const userHabit = realm
    .objects(USER_HABIT_SCHEMA)
    .filtered('mode_habit ==' + mode);
  return Promise.all(userHabit);
};

export const getUserHabitWithId = id => {
  const userHabit = realm
    .objects(USER_HABIT_SCHEMA)
    .filtered('Id_habit ==' + id);
  return Promise.all(userHabit);
};

export const insertHabit = habit => {
  const newHabit = realm.objects(USER_HABIT_SCHEMA);
  return new Promise((resolve, reject) => {
    realm.write(() => {
      realm.create(USER_HABIT_SCHEMA, habit);
      resolve(newHabit);
    });
  });
};

export const deleteUserHabit = habit => {
  const habits = realm.objects(USER_HABIT_SCHEMA);
  return new Promise(resolve => {
    realm.write(() => {
      realm.delete(habit);
      resolve(habits);
    });
  });
};

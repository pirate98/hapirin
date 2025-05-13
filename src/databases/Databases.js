export const USER_SCHEMA = 'UserInfo';

const Realm = require('realm');

export const UserInfo = {
  name: USER_SCHEMA,
  primaryKey: 'ID',
  properties: {
    ID: 'string',
    UserId: 'string',
    PassWord: 'string',
    Name: 'string',
    Mrs: 'string',
    Sex: 'string',
    Year: 'string',
    DelFg: 'string',
  },
};

export const UserHabitSchema = {
  name: 'UserHabit',
  properties: {
    Id_habit: 'int',
    title_habit: 'string',
    mode_habit: 'int',
    encouragement_sen: 'string',
    notification: {type: 'bool', default: false},
    time_notify: 'string',
    img_mode: 'string',
    mode_create: 'int',
    created_time: 'string',
  },
};

export const CharingSchema = {
  name: 'Charing',
  properties: {
    Id: 'int',
    userHabit: 'UserHabit[]',
    img_mode: 'string',
    title_habit: 'string',
    created_time: 'date',
  },
};

const databaseOptions = {
  path: 'hapirin.realm',
  schema: [UserInfo, UserHabitSchema, CharingSchema],
  schemaVersion: 0,
};

export default new Realm(databaseOptions);

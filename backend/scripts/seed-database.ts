import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Film } from '../src/schemas/film.schema';

async function seedDatabase() {
  const uri = 'mongodb://localhost:27017/film_afisha';
  
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Очищаем коллекцию
    await mongoose.connection.db.collection('films').deleteMany({});
    console.log('Cleared films collection');
    
    // Читаем данные из файла
    const dataPath = path.join(__dirname, '../test/mongodb_initial_stub.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Преобразуем строки дат в объекты Date
    const films = data.map(film => ({
      ...film,
      schedule: film.schedule.map(schedule => ({
        ...schedule,
        daytime: new Date(schedule.daytime)
      }))
    }));
    
    // Вставляем данные
    await mongoose.connection.db.collection('films').insertMany(films);
    console.log(`Inserted ${films.length} films`);
    
    // Проверяем
    const count = await mongoose.connection.db.collection('films').countDocuments();
    console.log(`Total films in database: ${count}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
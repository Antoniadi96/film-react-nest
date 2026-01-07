const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Подключаемся к MongoDB
const uri = 'mongodb://localhost:27017/film_afisha';

async function seedDatabase() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Очищаем коллекцию films
    await mongoose.connection.db.collection('films').deleteMany({});
    console.log('Cleared films collection');

    // Читаем данные из файла
    const dataPath = path.join(__dirname, '../test/mongodb_initial_stub.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Преобразуем данные для MongoDB
    const films = data.map(film => {
      const schedule = film.schedule.map(item => ({
        ...item,
        daytime: new Date(item.daytime)
      }));

      return {
        ...film,
        schedule,
        _id: film.id,
      };
    });

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
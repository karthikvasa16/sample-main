console.log('Attempting to require ./models...');
try {
    const models = require('./models');
    console.log('Successfully required models:', Object.keys(models));
} catch (error) {
    console.error('Failed to require models:', error);
}

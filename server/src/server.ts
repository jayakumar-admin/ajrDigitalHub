import app from './app';

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 DECOUPLED BACKEND ENGINE IN SERVICE`);
  console.log(`🌐 PORT: ${PORT}`);
  console.log(`📄 Swagger UI: http://localhost:${PORT}/api/docs`);
  console.log(`===============================================`);
});

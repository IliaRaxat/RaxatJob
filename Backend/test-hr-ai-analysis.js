/**
 * Тест системы AI анализа кандидатов для HR
 * 
 * Этот скрипт демонстрирует, как HR может использовать AI для анализа
 * всех откликов на вакансию и получения рейтинга лучших кандидатов.
 */

const axios = require('axios');

// Конфигурация
const BASE_URL = 'http://localhost:3000';
const HR_TOKEN = 'your_hr_token_here'; // Замените на реальный токен HR

// ID вакансии для анализа (замените на реальный ID)
const JOB_ID = 'job_123456789';

/**
 * Анализирует всех кандидатов на вакансию с помощью AI
 */
async function analyzeJobCandidates(jobId) {
  try {
    console.log(`🔍 Запускаем AI анализ кандидатов для вакансии: ${jobId}`);
    
    const response = await axios.post(`${BASE_URL}/hr-ai/analyze-job-candidates`, {
      jobId: jobId
    }, {
      headers: {
        'Authorization': `Bearer ${HR_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ AI анализ завершен успешно!');
      return response.data.data;
    } else {
      throw new Error('Анализ не удался');
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Ошибка API:', error.response.data.message || error.response.data);
    } else {
      console.error('❌ Ошибка сети:', error.message);
    }
    throw error;
  }
}

/**
 * Проверяет доступность AI сервиса
 */
async function checkAiHealth() {
  try {
    console.log('🏥 Проверяем доступность AI сервиса...');
    
    const response = await axios.get(`${BASE_URL}/hr-ai/health`, {
      headers: {
        'Authorization': `Bearer ${HR_TOKEN}`
      }
    });

    if (response.data.success) {
      console.log('✅ AI сервис доступен');
      return true;
    } else {
      console.log('❌ AI сервис недоступен');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки AI сервиса:', error.message);
    return false;
  }
}

/**
 * Выводит результаты анализа в удобном формате
 */
function displayAnalysisResults(analysis) {
  console.log('\n📊 РЕЗУЛЬТАТЫ AI АНАЛИЗА');
  console.log('='.repeat(50));
  
  console.log(`📋 Вакансия ID: ${analysis.jobId}`);
  console.log(`👥 Всего откликов: ${analysis.totalApplications}`);
  console.log(`⏱️ Время обработки: ${analysis.processingTime}мс`);
  console.log(`📝 Резюме: ${analysis.analysisSummary}`);
  
  console.log('\n🏆 ТОП КАНДИДАТЫ:');
  console.log('-'.repeat(50));
  
  analysis.topCandidates.forEach((candidate, index) => {
    console.log(`\n${index + 1}. Кандидат ${candidate.candidateId}`);
    console.log(`   📊 Общий балл: ${candidate.overallScore}/10`);
    console.log(`   🎯 Соответствие: ${candidate.matchScore}%`);
    console.log(`   📈 Уровень: ${candidate.fitLevel.toUpperCase()}`);
    
    if (candidate.strengths.length > 0) {
      console.log(`   ✅ Сильные стороны:`);
      candidate.strengths.forEach(strength => {
        console.log(`      • ${strength}`);
      });
    }
    
    if (candidate.weaknesses.length > 0) {
      console.log(`   ⚠️ Слабые стороны:`);
      candidate.weaknesses.forEach(weakness => {
        console.log(`      • ${weakness}`);
      });
    }
    
    if (candidate.recommendations.length > 0) {
      console.log(`   💡 Рекомендации:`);
      candidate.recommendations.forEach(rec => {
        console.log(`      • ${rec}`);
      });
    }
    
    console.log(`   🤖 AI комментарий: ${candidate.aiNotes}`);
  });
}

/**
 * Создает CSV отчет с результатами анализа
 */
function createCsvReport(analysis) {
  const csvHeader = 'Кандидат,Общий балл,Соответствие %,Уровень,Сильные стороны,Слабые стороны,Рекомендации,AI комментарий';
  
  const csvRows = analysis.topCandidates.map(candidate => {
    return [
      candidate.candidateId,
      candidate.overallScore,
      candidate.matchScore,
      candidate.fitLevel,
      `"${candidate.strengths.join('; ')}"`,
      `"${candidate.weaknesses.join('; ')}"`,
      `"${candidate.recommendations.join('; ')}"`,
      `"${candidate.aiNotes}"`
    ].join(',');
  });
  
  const csvContent = [csvHeader, ...csvRows].join('\n');
  
  console.log('\n📄 CSV ОТЧЕТ:');
  console.log('-'.repeat(50));
  console.log(csvContent);
  
  return csvContent;
}

/**
 * Основная функция тестирования
 */
async function main() {
  console.log('🚀 ТЕСТ СИСТЕМЫ AI АНАЛИЗА КАНДИДАТОВ');
  console.log('='.repeat(50));
  
  try {
    // 1. Проверяем доступность AI сервиса
    const isHealthy = await checkAiHealth();
    if (!isHealthy) {
      console.log('❌ AI сервис недоступен. Завершаем тест.');
      return;
    }
    
    // 2. Запускаем анализ кандидатов
    console.log('\n🤖 Запускаем AI анализ...');
    const analysis = await analyzeJobCandidates(JOB_ID);
    
    // 3. Выводим результаты
    displayAnalysisResults(analysis);
    
    // 4. Создаем CSV отчет
    const csvReport = createCsvReport(analysis);
    
    // 5. Сохраняем отчет в файл (опционально)
    const fs = require('fs');
    const filename = `ai-analysis-${JOB_ID}-${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(filename, csvReport);
    console.log(`\n💾 Отчет сохранен в файл: ${filename}`);
    
    console.log('\n✅ Тест завершен успешно!');
    
  } catch (error) {
    console.error('\n❌ Тест завершился с ошибкой:', error.message);
    process.exit(1);
  }
}

// Запуск теста
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeJobCandidates,
  checkAiHealth,
  displayAnalysisResults,
  createCsvReport
};

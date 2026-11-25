/* ============================================================
   services/visibilityFilter.js —— 内容可见性过滤器（框架）
   约束：复习 / 巩固 / 每日一句 / 随机测验的题目
   只从用户已学习、已解锁的内容池中抽取，严禁超前。
   与闯关解锁逻辑共用同一数据源（levels.js + progress store）。
   本批实现框架函数，阶段 5+ 的实际出题调用方接入。
   ============================================================ */
import { LEVELS, getLevel } from '../data/levels'
import { getCorpusWords } from './wordData'

/* 关卡是否已解锁（与 progress store 相同口径） */
export function isStageUnlockedByData(progressData, stageId) {
  if (!progressData) return false
  const stage = findStageById(stageId)
  if (!stage) return false
  if (!isLevelUnlockedByData(progressData, stage.level)) return false
  if (stage.stage === 1) return true
  const prev = progressData.progress.stages[`${stage.level}-${stage.stage - 1}`]
  return !!(prev && prev.completed)
}

/* 等级是否已解锁 */
export function isLevelUnlockedByData(progressData, level) {
  if (!progressData) return false
  if (level <= 1) return true
  const prevLevel = getLevel(level - 1)
  if (!prevLevel) return false
  const total = prevLevel.stages.length
  const completed = prevLevel.stages.filter(
    (st) => progressData.progress.stages[st.id] && progressData.progress.stages[st.id].completed
  ).length
  return total > 0 && completed / total >= 0.8
}

/* 关卡是否已完成（可复习的内容范围 = 已通关关卡内容） */
export function isStageCompletedByData(progressData, stageId) {
  return !!(progressData && progressData.progress.stages[stageId] && progressData.progress.stages[stageId].completed)
}

function findStageById(stageId) {
  for (const lv of LEVELS) {
    const st = lv.stages.find((s) => s.id === stageId)
    if (st) return { ...st, level: lv.level }
  }
  return null
}

/**
 * 获取当前可见（已解锁）关卡列表
 * @returns {Array<{stage, level}>}
 */
export function getVisibleStages(progressData) {
  const result = []
  for (const lv of LEVELS) {
    for (const st of lv.stages) {
      if (isStageUnlockedByData(progressData, st.id)) {
        result.push({ stage: st, level: lv })
      }
    }
  }
  return result
}

/**
 * 获取当前已解锁等级对应的语料生词池（L6/L13/L14 固定内容等级）。
 * 等级解锁（上一级完成 ≥80%）后即视为已解锁内容池，复习/巩固测验可从中选题，
 * 与 getReviewableStages 的"不超前"口径一致：仅返回已解锁等级的词，不返回超前等级内容。
 * @returns {Array<object>} 词条对象（word/ipa/pos/zh/example/cefr/level/source）
 */
export function getUnlockedCorpusWords(progressData) {
  const result = []
  for (const lv of [6, 13, 14]) {
    if (isLevelUnlockedByData(progressData, lv)) {
      result.push(...getCorpusWords(`l${lv}`))
    }
  }
  return result
}

/**
 * 获取当前可复习（已通关）关卡列表，用于复习/巩固选题
 * @returns {Array<{stage, level}>}
 */
export function getReviewableStages(progressData) {
  const result = []
  for (const lv of LEVELS) {
    for (const st of lv.stages) {
      if (isStageCompletedByData(progressData, st.id)) {
        result.push({ stage: st, level: lv })
      }
    }
  }
  return result
}

/**
 * 题目出处标注：复习/巩固题须标注来源关卡，便于回看
 * @param {object} item 题目对象
 * @param {string} stageId 来源关卡
 */
export function annotateSource(item, stageId) {
  return { ...item, sourceStage: stageId }
}

export { LEVELS, getLevel }

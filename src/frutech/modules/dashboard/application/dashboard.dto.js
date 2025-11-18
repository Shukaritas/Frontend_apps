/**
 * @typedef {object} PreviewFieldDTO
 * @property {number} id
 * @property {string} imageUrl
 * @property {string} title
 */

/**
 * @typedef {object} RecommendationDTO
 * @property {number} id
 * @property {string} title
 * @property {string} content
 */

/**
 * @typedef {object} UpcomingTaskDTO
 * @property {number} id
 * @property {string} date
 * @property {string} name
 * @property {string} task
 */

/**
 * @typedef {object} DashboardDTO
 * @property {Array<PreviewFieldDTO>} previewFields
 * @property {Array<RecommendationDTO>} recommendations
 * @property {Array<UpcomingTaskDTO>} upcomingTasks
 */
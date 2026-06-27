/**
 * @ai-summary
 * Service layer for LearnHub LMS business logic. Entry point is the
 * collection-specific service (e.g. GradebookService, DiscussionService);
 * PayloadGradebookService wires GradebookService to Payload CMS.
 *
 * GOTCHA: Services here are framework-agnostic where possible (typed dep
 * interfaces), but concrete wired implementations (e.g. PayloadGradebookService)
 * import directly from 'payload' and must not be imported on the client.
 */

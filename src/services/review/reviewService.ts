import reviewQueryService from "./reviewQueryService";
import reviewMutationService from "./reviewMutationService";
import reviewImageService from "./imageService";

// Re-export services as a unified API
const reviewService = {
  // Query operations
  getReviews: reviewQueryService.getReviews,
  getReview: reviewQueryService.getReview,
  
  // Mutation operations
  createReview: reviewMutationService.createReview,
  updateReview: reviewMutationService.updateReview,
  deleteReview: reviewMutationService.deleteReview,
  updateReviewStatus: reviewMutationService.updateReviewStatus,
  
  // Image operations
  getReviewImages: reviewImageService.getReviewImages,
  addReviewImage: reviewImageService.addReviewImage,
  updateReviewImage: reviewImageService.updateReviewImage,
  deleteReviewImage: reviewImageService.deleteReviewImage,
  updateImagesOrder: reviewImageService.updateImagesOrder
};

export default reviewService;

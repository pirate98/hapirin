import platforms from '../utils/platforms';

const guidelineBaseWidth = platforms.isIOS ? 375 : 360;
const guidelineBaseHeight = platforms.isIOS ? 812 : 640;

const horizontalScale = (size: number) =>
  (size / guidelineBaseWidth) * platforms.widthScreen;
const verticalScale = (size: number) =>
  (size / guidelineBaseHeight) * platforms.heightScreen;
const moderateScale = (size: number, factor: number = 0 / 5) =>
  (size / guidelineBaseHeight) * platforms.heightScreen;

const horizontal = (size: number) => horizontalScale(size);
const vertical = (size: number) => verticalScale(size);
const moderate = (size: number) => moderateScale(size);

const scales = {
  horizontalScale,
  verticalScale,
  moderateScale,
  vertical,
  horizontal,
  moderate,
};

export default scales;

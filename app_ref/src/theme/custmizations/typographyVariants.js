export const createTypographyVariant = (
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  marginTop
) => ({
  fontFamily: "Inter",
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  marginTop,
  textAlign: "left",
  color: "#172B4D",
  // Default color
});

export const typographyVariants = {
  D1Regular: createTypographyVariant("36px", 400, "48px", "-0.01em", "52px"),
  D1SemiBold: createTypographyVariant("36px", 600, "48px", "-0.01em", "52px"),
  D1Bold: createTypographyVariant("36px", 700, "48px", "-0.01em", "52px"),

  h1Regular: createTypographyVariant("28px", 400, "38px", "-0.01em", "48px"),
  h1SemiBold: createTypographyVariant("28px", 600, "38px", "-0.01em", "48px"),
  h1Bold: createTypographyVariant("28px", 700, "38px", "-0.01em", "48px"),

  h2Regular: createTypographyVariant("24px", 400, "28px", "-0.01em", "40px"),
  h2SemiBold: createTypographyVariant("24px", 600, "28px", "-0.01em", "40px"),
  h2Bold: createTypographyVariant("24px", 700, "28px", "-0.01em", "40px"),

  h3Regular: createTypographyVariant("20px", 400, "24px", "-0.008em", "36px"),
  h3SemiBold: createTypographyVariant("20px", 600, "24px", "-0.008em", "36px"),
  h3Bold: createTypographyVariant("20px", 700, "24px", "-0.008em", "36px"),

  h4Regular: createTypographyVariant("16px", 400, "20px", "-0.006em", "32px"),
  h4SemiBold: createTypographyVariant("16px", 600, "20px", "-0.006em", "32px"),
  h4Bold: createTypographyVariant("16px", 700, "20px", "-0.006em", "32px"),

  h5Regular: createTypographyVariant("14px", 400, "20px", "-0.003em", "24px"),
  h5SemiBold: createTypographyVariant("14px", 600, "20px", "-0.003em", "24px"),
  h5Bold: createTypographyVariant("14px", 700, "20px", "-0.003em", "24px"),

  h6Regular: createTypographyVariant("12px", 400, "14.52px", "0", "20px"),
  h6SemiBold: createTypographyVariant("12px", 600, "14.52px", "0", "20px"),
  h6Bold: createTypographyVariant("12px", 700, "14.52px", "0", "20px"),

  h7Regular: createTypographyVariant("10px", 400, "12.1px", "0", "16px"),
  h7SemiBold: createTypographyVariant("10px", 600, "12.1px", "0", "16px"),
  h7Bold: createTypographyVariant("10px", 700, "12.1px", "-0.08em", "16px"),

  pRegular: createTypographyVariant("14px", 400, "20px", "-0.006em", "0px"),
  pSemiBold: createTypographyVariant("14px", 600, "20px", "-0.006em", "0px"),
  pBold: createTypographyVariant("14px", 700, "20px", "-0.006em", "0px"),
};

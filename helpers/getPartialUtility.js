module.exports = (criterion, value, userPreferenceModel) => {
  const { partials, weight } = userPreferenceModel[criterion];
  const partialFunction = partials
    .filter(partial => value <= partial.max)[0];
  return partialFunction
    ? (partialFunction.offset + (value - partialFunction.min) * partialFunction.slope) * weight
    : 0;
};

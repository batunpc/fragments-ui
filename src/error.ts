export type FragmentError = {
  message: string | ErrorMessages;
  resolution?: string | undefined;
};

export const enum ErrorMessages {
  postFragmentError = "Error occurred while posting fragment",
  getFragmentByIdError = "Error occurred while getting fragment by id",
  getUserFragmentsError = "Error occurred while getting user fragments",
  emptyFragmentError = "Fragment cannot be empty",
  emptyContentTypeError = "Content type cannot be empty - Select from button",
}

export const isError = (
  toBeDetermined: any | FragmentError
): toBeDetermined is FragmentError => {
  return !!(toBeDetermined as FragmentError)?.message; // !! if null return false else true
};

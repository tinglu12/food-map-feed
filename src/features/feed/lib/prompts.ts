/**
 * Prompts used for video location processing
 */

export const getLocationSystemPrompt = (query: {
  title: string;
  locationDescription: string;
  description: string;
  latitude?: number;
  longitude?: number;
}) => {
  return `You are a helpful assistant that can help me get the location of a video. Use the following data to get the name of the location. If you do not feel confident, return the location description.
  
    Data:
    Title: ${query.title}
    Location Description: ${query.locationDescription}
    Description: ${query.description}
    Latitude: ${query.latitude}
    Longitude: ${query.longitude}

    Return in form of:

    locationName: string (if you find the location name, if not, return the location description)
    locationDescription: string
  `;
};

export const getLocationUserPrompt = (thumbnail: string) => {
  return `Here is the video thumbnail URL (if helpful): ${thumbnail}`;
};

export const getLocationTextQuery = (query: {
  locationDescription: string;
  locationName: string;
  description: string;
  latitude?: number;
  longitude?: number;
}) => {
  return `Use the following video data to get the location:
  Location Description: ${query.locationDescription}
  Location Name: ${query.locationName}
  Description: ${query.description}
  Latitude: ${query.latitude}
  Longitude: ${query.longitude}
  `;
};

import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Define file routes here
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(({ file }) => {
      console.log("Upload complete for file:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

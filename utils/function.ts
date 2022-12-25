import { existsSync } from "fs";

export const mbTObytes = (mb: number) => {
  const multiplication = 1048576;
  return mb * multiplication;
};

/// 1. image/jpeg (jpg)
/// 2. image/png (png)
/// 3. image/jpg (jpg)
/// 3. application/pdf (pdf)
/// 4. application/vnd.openxmlformats-officedocument.wordprocessingml.document (docx)
/// 5. application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (xlsx)
export const validationFile = ({
  file,
  allowedMimetype,
  limitSizeMB,
  onError,
}: {
  file: any;
  allowedMimetype: Array<"jpg" | "png" | "jpeg" | "pdf" | "docx" | "xlsx">;
  limitSizeMB: number;
  onError: (message: string) => void;
}) => {
  if (!existsSync(file.filepath)) return onError("File tidak valid");
  const mimetype = file.mimetype;
  const validMimetype: Array<
    | "image/jpeg"
    | "image/png"
    | "image/jpg"
    | "application/pdf"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  > = [];

  allowedMimetype.forEach((val) => {
    switch (val) {
      case "jpeg":
        validMimetype.push("image/jpeg");
        break;
      case "png":
        validMimetype.push("image/png");
        break;
      case "jpg":
        validMimetype.push("image/jpg");
        break;
      case "pdf":
        validMimetype.push("application/pdf");
        break;
      case "docx":
        validMimetype.push(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        break;
      case "xlsx":
        validMimetype.push(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        break;

      default:
        return;
    }
  });

  if (!validMimetype.includes(mimetype)) {
    return onError(`File harus berupa ${allowedMimetype.join(",")}`);
  }

  if ((file.size as number) > mbTObytes(limitSizeMB)) {
    return onError(
      `File ${file.originalFilename} tidak boleh melebihi ${limitSizeMB}Mb`
    );
  }

  return true;
};

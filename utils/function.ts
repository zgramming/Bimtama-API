import { existsSync, mkdirSync, renameSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

type ValidateFileType = {
  allowedExtension: Array<
    | ".jpg"
    | ".jpeg"
    | ".png"
    | ".doc"
    | ".docx"
    | ".pdf"
    | ".ppt"
    | ".pptx"
    | ".xls"
    | ".xlsx"
  >;
  allowedMimetypes: Array<
    | "application/msword"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    | "image/jpeg"
    | "image/png"
    | "application/pdf"
    | "application/vnd.ms-powerpoint"
    | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    | "application/vnd.ms-excel"
    | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  >;

  /// Mb
  allowedSize: number;

  /// Give name to file without extension. Example : myfile | thisismydocument
  filename?: string;
};

type FileValidate = {
  filename: string;
  size: number;
  mimetype: string;
};

type ValidateFileResult = {
  error?: string;
  name?: string;
};

export const generateUUID = () => {
  return uuidv4();
};

export const validateFile = (
  file: FileValidate,
  { config }: { config: ValidateFileType }
): ValidateFileResult => {
  const defaultName = generateUUID();
  const extension = path.extname(file.filename) as unknown as any;

  if (!config.allowedExtension.includes(extension)) {
    return {
      error: `Extension tidak valid. Extension yang diperbolehkan ${config.allowedExtension.join(
        ","
      )}`,
    };
  }

  if (!config.allowedMimetypes.includes(file.mimetype as unknown as any)) {
    return {
      error: `Mimetype tidak valid. Mimetype yang diperbolehkan ${config.allowedMimetypes.join(
        ","
      )}`,
    };
  }

  const fileSize = file.size / (1024 * 1024);
  if (fileSize > config.allowedSize) {
    return {
      error: `File terlalu besar. Ukurang yang diperbolehkan ${config.allowedSize} Mb`,
    };
  }

  const name = config.filename
    ? `${config.filename}${extension}`
    : `${defaultName}${extension}`;

  return { name: name };
};

export const moveFile = (
  /// /public/images/image.jpg
  oldPath: string,
  newPath: string
) => {
  const name = path.basename(newPath);
  const dir = path.dirname(newPath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  renameSync(oldPath, newPath);
};

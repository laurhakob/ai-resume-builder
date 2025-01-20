// "use server";

// import prisma from "@/lib/prisma";
// import { resumeSchema, ResumeValues } from "@/lib/validation";
// import { auth } from "@clerk/nextjs/server";

// export async function saveResume(values: ResumeValues) {
//   const { id } = values;

//   console.log("received values", values);

//   const { photo, workExperiences, educations, ...resumeValues } =
//     resumeSchema.parse(values);

//   const { userId } = await auth();

//   if (!userId) {
//     throw new Error("User not authenticated");
//   }

//   // TODO: Check resume count for non-premium users

//   const existingResume = id
//     ? await prisma.resume.findUnique({ where: { id, userId } })
//     : null;

//   if (id && !existingResume) {
//     throw new Error("Resume not found");
//   }

//   let newPhotoUrl: string | undefined | null = undefined;

// }

"use server";

import prisma from "@/lib/prisma";
import { resumeSchema, ResumeValues } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // For unique filenames

export async function saveResume(values: ResumeValues) {
  const { id } = values;

  console.log("received values", values);

  const { photo, workExperiences, educations, ...resumeValues } =
    resumeSchema.parse(values);

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // TODO: Check resume count for non-premium users

  const existingResume = id
    ? await prisma.resume.findUnique({ where: { id, userId } })
    : null;

  if (id && !existingResume) {
    throw new Error("Resume not found");
  }

  let newPhotoUrl: string | undefined | null = undefined;

  if (photo instanceof File) {
    if (existingResume?.photoUrl) {
      // Delete the existing file if applicable
      const existingPath = path.join(
        process.cwd(),
        "uploads",
        existingResume.photoUrl,
      );
      if (fs.existsSync(existingPath)) {
        fs.unlinkSync(existingPath);
      }
    }

    // Save the new photo
    const uniqueFilename = `${uuidv4()}${path.extname(photo.name)}`;
    const uploadDir = path.join(process.cwd(), "uploads");

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFilename);
    const buffer = await photo.arrayBuffer();

    fs.writeFileSync(filePath, Buffer.from(buffer));

    newPhotoUrl = `/uploads/${uniqueFilename}`; // Store relative path
  } else if (photo === null) {
    if (existingResume?.photoUrl) {
      const existingPath = path.join(
        process.cwd(),
        "uploads",
        existingResume.photoUrl,
      );
      if (fs.existsSync(existingPath)) {
        fs.unlinkSync(existingPath);
      }
    }
    newPhotoUrl = null;
  }

  if (id) {
    return prisma.resume.update({
      where: { id },
      data: {
        ...resumeValues,
        photoUrl: newPhotoUrl,
        workExperiences: {
          deleteMany: {},
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        educations: {
          deleteMany: {},
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
        updatedAt: new Date(),
      },
    });
  } else {
    return prisma.resume.create({
      data: {
        ...resumeValues,
        userId,
        photoUrl: newPhotoUrl,
        workExperiences: {
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        educations: {
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
      },
    });
  }
}

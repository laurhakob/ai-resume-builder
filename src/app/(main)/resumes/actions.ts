

// "use server";

// import prisma from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { del } from "@vercel/blob";
// import { revalidatePath } from "next/cache";

// export async function deleteResume(id: string) {
//   const { userId } = await auth();

//   if (!userId) {
//     throw new Error("User not authenticated");
//   }

//   const resume = await prisma.resume.findUnique({
//     where: {
//       id,
//       userId,
//     },
//   });

//   if (!resume) {
//     throw new Error("Resume not found");
//   }

//   if (resume.photoUrl) {
//     await del(resume.photoUrl);
//   }

//   await prisma.resume.delete({
//     where: {
//       id,
//     },
//   });

//   revalidatePath("/resumes");
// }


// chat gbt

"use server";

 import prisma from "@/lib/prisma";
 import { auth } from "@clerk/nextjs/server";
 import { del } from "@vercel/blob";
 import { revalidatePath } from "next/cache";


export async function deleteResume(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (resume.photoUrl) {
    await del(resume.photoUrl);
  }

  // Delete related records manually
  await prisma.education.deleteMany({
    where: { resumeId: id },
  });
  await prisma.workExperience.deleteMany({
    where: { resumeId: id },
  });

  // Delete the resume
  await prisma.resume.delete({
    where: { id },
  });

  revalidatePath("/resumes");
}


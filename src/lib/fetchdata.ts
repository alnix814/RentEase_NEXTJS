import prisma from "@/lib/prisma";

interface PropertyProps {
    userid?: string;
}

export async function FetchPropertys({ userid }: PropertyProps) {
    try {

        const property = await prisma.property.findMany()

        return property;

    } catch (error) {

        return error;

    }
}

interface UsersProps {
    email?: string;
    userid?: string;
    propertyid?: string;
}

export async function FetchUser({ email, userid, propertyid }: UsersProps) {
    try {

        const user = await prisma.user.findFirst({
            where: {
                email: email,
                id: userid,
                properties: {
                    some: {
                        id: propertyid,
                    }
                }
            }
        })

        return user;

    } catch (error) {

        return error;

    }
}

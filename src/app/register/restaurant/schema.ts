import * as z from "zod"

export const restaurantFormSchema = z.object({
    name: z.string().min(2, {
        message: "Restaurant name must be at least 2 characters.",
    }),
    owner_email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    owner_phone: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }),
    account_holder_name: z.string().min(2, {
        message: "Account holder name is required.",
    }),
    account_number: z.string().min(5, {
        message: "Account number is required.",
    }),
    ifsc_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
        message: "Invalid IFSC code format.",
    }),
    upi_id: z.string().optional(),
    fssai_license: z.string().optional(),
    gst: z.string().optional(),
    pan: z.string().regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, {
        message: "Invalid PAN format"
    }).optional().or(z.literal('')),
})

export type RestaurantFormValues = z.infer<typeof restaurantFormSchema>

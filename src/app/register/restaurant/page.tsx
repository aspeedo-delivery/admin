
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useToast } from '@/hooks/use-toast';

/* ===================== SCHEMA ===================== */

const formSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/),

  restaurantName: z.string().min(1),
  restaurantAddress: z.string().min(1),
  city: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/),
  restaurantLogo: z.any().optional(),

  ownerFullName: z.string().min(1),
  ownerRole: z.enum(['owner', 'manager', 'partner']),

  businessType: z.enum(['individual', 'partnership', 'company']),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),

  openingTime: z.string(),
  closingTime: z.string(),
  weeklyOffDay: z.enum([
    'None',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  foodType: z.array(z.string()),
  priceDetails: z.string().optional(),

  bankAccountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  accountHolderName: z.string().optional(),
  upiId: z.string().optional(),

  fssaiLicense: z.any().optional(),
  gstCertificate: z.any().optional(),
  panCard: z.any().optional(),
  bankProof: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  'Contact Information',
  'Restaurant Details',
  'Owner / Partner Details',
  'Business Details',
  'Timings & Cuisine',
  'Menu & Pricing',
  'Bank Details',
  'Documents',
  'Preview',
  'Success',
];

export default function RestaurantRegistrationPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      phone: '',
      restaurantName: '',
      restaurantAddress: '',
      city: '',
      pincode: '',
      restaurantLogo: undefined,
      ownerFullName: '',
      ownerRole: 'owner',
      businessType: 'individual',
      gstNumber: '',
      panNumber: '',
      openingTime: '',
      closingTime: '',
      weeklyOffDay: 'None',
      foodType: [],
      priceDetails: '',
      bankAccountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      upiId: '',
      fssaiLicense: undefined,
      gstCertificate: undefined,
      panCard: undefined,
      bankProof: undefined,
    },
  });

  const submit = (data: FormValues) => {
    startTransition(() => {
        // Mock submission
        console.log('Submitting mock data:', data);
        setTimeout(() => {
            toast({
                title: 'Registration Submitted',
                description: 'Your restaurant registration is being processed.',
            });
            setCurrentStep(s => s + 1);
        }, 1000);
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
       <div className="w-full max-w-2xl mb-4">
        <Button variant="outline" asChild>
            <Link href="/login" className="inline-flex items-center gap-2">
                <ArrowLeft />
                Go Back to Login
            </Link>
        </Button>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <ProgressBar currentStep={currentStep} totalSteps={steps.length - 1} />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* STEP 0 – CONTACT */}
                  {currentStep === 0 && (
                    <Section title="Contact Information">
                      <InputField name="email" label="Email" type="email" />
                      <InputField name="phone" label="Phone Number" type="tel" />
                    </Section>
                  )}
                  {/* STEP 1 – RESTAURANT */}
                  {currentStep === 1 && (
                    <Section title="Restaurant Details">
                      <InputField name="restaurantName" label="Restaurant Name" />
                      <TextareaField name="restaurantAddress" label="Complete Address" />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField name="city" label="City" />
                        <InputField name="pincode" label="Pincode" />
                      </div>
                      <FileField name="restaurantLogo" label="Restaurant Logo/Image" />
                    </Section>
                  )}
                  {/* STEP 2 – OWNER */}
                  {currentStep === 2 && (
                    <Section title="Owner / Partner Details">
                      <InputField name="ownerFullName" label="Full Name" />
                      <FormField
                        control={form.control}
                        name="ownerRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Role</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-2"
                              >
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl><RadioGroupItem value="owner" /></FormControl>
                                  <FormLabel className="font-normal">Owner</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl><RadioGroupItem value="manager" /></FormControl>
                                  <FormLabel className="font-normal">Manager</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl><RadioGroupItem value="partner" /></FormControl>
                                  <FormLabel className="font-normal">Partner</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </Section>
                  )}

                  {/* STEP 3 – BUSINESS */}
                  {currentStep === 3 && (
                    <Section title="Business Details">
                      <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type of Business</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-2"
                                >
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="individual" /></FormControl>
                                    <FormLabel className="font-normal">Individual/Proprietor</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="partnership" /></FormControl>
                                    <FormLabel className="font-normal">Partnership</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="company" /></FormControl>
                                    <FormLabel className="font-normal">Company</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <InputField name="gstNumber" label="GST Number (optional)" />
                      <InputField name="panNumber" label="PAN Number (optional)" />
                    </Section>
                  )}

                  {/* STEP 4 - TIMINGS */}
                  {currentStep === 4 && (
                     <Section title="Timings & Cuisine">
                        <div className="grid grid-cols-2 gap-4">
                           <InputField name="openingTime" label="Opening Time" type="time" />
                           <InputField name="closingTime" label="Closing Time" type="time" />
                        </div>
                         <SelectField name="weeklyOffDay" label="Weekly Off Day" options={['None', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} />
                    </Section>
                  )}

                  {/* STEP 5 – MENU */}
                  {currentStep === 5 && (
                    <Section title="Menu & Pricing">
                      <FormField
                        control={form.control}
                        name="foodType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>We serve:</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                          {['Veg only', 'Non-veg', 'Both'].map((item) => (
                                              <FormItem key={item} className="flex items-center space-x-2">
                                                  <Checkbox
                                                      checked={field.value?.includes(item)}
                                                      onCheckedChange={(checked) => {
                                                          return checked
                                                              ? field.onChange([...(field.value || []), item])
                                                              : field.onChange(
                                                                  (field.value || []).filter(
                                                                      (value) => value !== item
                                                                  )
                                                          );
                                                      }}
                                                  />
                                                  <FormLabel className="font-normal">{item}</FormLabel>
                                              </FormItem>
                                          ))}
                                      </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                      />
                      <TextareaField name="priceDetails" label="Price Details" placeholder="e.g., Average cost for two people is ₹500" />
                    </Section>
                  )}

                  {/* STEP 6 – BANK */}
                  {currentStep === 6 && (
                    <Section title="Bank Details">
                      <InputField name="bankAccountNumber" label="Account Number" />
                      <InputField name="ifscCode" label="IFSC Code" />
                      <InputField name="accountHolderName" label="Account Holder Name" />
                      <InputField name="upiId" label="UPI ID (optional)" />
                    </Section>
                  )}

                  {/* STEP 7 – DOCUMENTS */}
                  {currentStep === 7 && (
                    <Section title="Documents Upload">
                      <FileField name="fssaiLicense" label="FSSAI License" />
                      <FileField name="gstCertificate" label="GST Certificate" />
                      <FileField name="panCard" label="PAN Card" />
                      <FileField name="bankProof" label="Cancelled Cheque / Bank Proof" />
                    </Section>
                  )}

                  {/* STEP 8 - PREVIEW */}
                  {currentStep === 8 && (
                    <PreviewSection values={form.getValues()} />
                  )}

                  {/* SUCCESS */}
                  {currentStep === 9 && (
                    <div className="text-center py-12 space-y-4">
                      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                      <CardTitle>Registration Submitted for Review</CardTitle>
                      <CardDescription>
                        Thank you for registering. We have received your details and will get back to you shortly.
                      </CardDescription>
                       <Button asChild variant="outline">
                        <Link href="/login">Back to Login</Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </form>
          </Form>
        </CardContent>

        {currentStep < 9 && (
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(s => s - 1)}
            >
              Previous
            </Button>

            {currentStep < 8 && (
              <Button
                onClick={() => setCurrentStep(s => s + 1) }
              >
                Next
              </Button>
            )}

            {currentStep === 8 && (
                 <Button
                    disabled={isPending}
                    onClick={form.handleSubmit(submit)}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Submission
                </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

/* ===================== REUSABLE UI ===================== */

function Section({ title, children }: any) {
  return (
    <div className="space-y-4">
      <CardTitle>{title}</CardTitle>
      {children}
    </div>
  );
}

function PreviewSection({ values }: { values: FormValues }) {
    const renderValue = (value: any) => {
        if (Array.isArray(value)) {
            return value.join(', ') || 'N/A';
        }
        if (typeof value === 'object' && value?.name) {
            return value.name; // For file objects
        }
        return value || 'N/A';
    };

    return (
        <Section title="Preview Your Details">
            <CardDescription>Please review all your information carefully before submitting.</CardDescription>
            <div className="space-y-6 pt-4">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Email:</strong> {renderValue(values.email)}</p>
                        <p><strong>Phone:</strong> {renderValue(values.phone)}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Restaurant Details</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                        <p><strong>Name:</strong> {renderValue(values.restaurantName)}</p>
                        <p><strong>Address:</strong> {renderValue(values.restaurantAddress)}, {renderValue(values.city)}, {renderValue(values.pincode)}</p>
                    </div>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Owner / Partner</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Full Name:</strong> {renderValue(values.ownerFullName)}</p>
                        <p><strong>Role:</strong> {renderValue(values.ownerRole)}</p>
                    </div>
                </div>
                {/* Add more sections as needed */}
            </div>
        </Section>
    );
}

function InputField({ name, label, type = 'text', placeholder }: any) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} type={type} placeholder={placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TextareaField({ name, label, placeholder }: any) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder={placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SelectField({ name, label, options }: any) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o: string) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}

function FileField({ name, label }: any) {
    const { control } = useFormContext();
    return (
      <FormField
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type="file"
                ref={ref}
                name={name}
                onBlur={onBlur}
                onChange={(e) => onChange(e.target.files?.[0])}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

    
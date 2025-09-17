// src/features/properties/components/PropertyForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Alert,
  AlertDescription,
  Badge,
  Separator,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  Input,
} from '@/shared/components/ui';
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  PoundSterling,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import type {
  Property,
  CreatePropertyData,
  UpdatePropertyData,
} from '@/domains/properties/types';
import { useUkAddressAutocomplete } from '@/shared/hooks';

// Validation schema for property form
const PropertyFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Property title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    county: z.string().optional(),
    postcode: z
      .string()
      .min(1, 'Postcode is required')
      .regex(
        /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i,
        'Invalid UK postcode format'
      ),
    country: z.string(),
  }),
  propertyType: z.enum([
    'detached',
    'semi_detached',
    'terraced',
    'flat',
    'bungalow',
  ]),
  tenure: z.enum(['freehold', 'leasehold', 'commonhold']),
  bedrooms: z.number().min(0).max(50).optional(),
  bathrooms: z.number().min(0).max(50).optional(),
  receptionRooms: z.number().min(0).max(50).optional(),
  floorArea: z.number().min(0).optional(),
  plotSize: z.number().min(0).optional(),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()).optional(),
  councilTaxBand: z.string().optional(),
  energyRating: z.string().optional(),
  askingPrice: z.number().min(0).optional(),
  estimatedValue: z.number().min(0).optional(),
  monthlyServiceCharge: z.number().min(0).optional(),
  groundRent: z.number().min(0).optional(),
  leaseYearsRemaining: z.number().min(0).optional(),
  freeholder: z.string().optional(),
  managementCompany: z.string().optional(),
  keyFeatures: z.array(z.string()).optional(),
  nearbyAmenities: z.array(z.string()).optional(),
  targetCompletionDate: z.date().optional(),
});

type PropertyFormData = z.infer<typeof PropertyFormSchema>;

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: CreatePropertyData | UpdatePropertyData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
  testId?: string;
}

/**
 * PropertyForm component - Built with shadcn/ui
 * Multi-step form for creating and editing properties
 */
export const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
  className = '',
  testId = 'property-form',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const apiKey =
    import.meta.env.VITE_GETADDRESS_API_KEY || 'your_getaddress_api_key_here';
  const { suggestions, loading, error, fetchPostcodeLookup, clearSuggestions } =
    useUkAddressAutocomplete(apiKey);

  const steps = [
    { id: 'basic', title: 'Basic Details', icon: Home },
    { id: 'address', title: 'Address', icon: MapPin },
    { id: 'features', title: 'Features', icon: Bed },
    { id: 'financial', title: 'Financial', icon: PoundSterling },
  ];

  // Parse default values using the schema to ensure proper typing
  const looseDefaults = {
    title: property?.title || '',
    description: property?.description || '',
    address: {
      line1: property?.address?.line1 || '',
      line2: property?.address?.line2 || '',
      city: property?.address?.city || '',
      county: property?.address?.county || '',
      postcode: property?.address?.postcode || '',
      country: property?.address?.country || 'UK',
    },
    propertyType: property?.propertyType || 'detached',
    tenure: property?.tenure || 'freehold',
    bedrooms: property?.bedrooms,
    bathrooms: property?.bathrooms,
    receptionRooms: property?.receptionRooms,
    floorArea: property?.floorArea,
    plotSize: property?.plotSize,
    yearBuilt: property?.yearBuilt,
    councilTaxBand: property?.councilTaxBand,
    energyRating: property?.energyRating,
    askingPrice: property?.askingPrice,
    estimatedValue: property?.estimatedValue,
    monthlyServiceCharge: property?.monthlyServiceCharge,
    groundRent: property?.groundRent,
    leaseYearsRemaining: property?.leaseYearsRemaining,
    freeholder: property?.freeholder || '',
    managementCompany: property?.managementCompany || '',
    keyFeatures: property?.keyFeatures || [],
    nearbyAmenities: property?.nearbyAmenities || [],
    targetCompletionDate: property?.targetCompletionDate
      ? new Date(property.targetCompletionDate)
      : undefined,
  };

  const defaultValues = PropertyFormSchema.parse(looseDefaults);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { isValid },
  } = form;
  const watchedTenure = watch('tenure');
  const watchedPostcode = watch('address.postcode');

  // Fetch address suggestions when postcode changes
  useEffect(() => {
    if (watchedPostcode && currentStep === 1) {
      fetchPostcodeLookup(watchedPostcode);
      setShowSuggestions(true);
    } else {
      clearSuggestions();
      setShowSuggestions(false);
    }
  }, [watchedPostcode, fetchPostcodeLookup, clearSuggestions, currentStep]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => setSubmitSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  const handleFormSubmit = async (data: PropertyFormData) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit(data as any);
      setSubmitSuccess(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save property';
      setSubmitError(message);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep);
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepFields = (stepIndex: number): (keyof PropertyFormData)[] => {
    switch (stepIndex) {
      case 0:
        return ['title', 'description', 'propertyType', 'tenure'];
      case 1:
        return ['address'];
      case 2:
        return [
          'bedrooms',
          'bathrooms',
          'receptionRooms',
          'floorArea',
          'plotSize',
          'yearBuilt',
          'councilTaxBand',
          'energyRating',
        ];
      case 3:
        return [
          'askingPrice',
          'estimatedValue',
          'monthlyServiceCharge',
          'groundRent',
          'leaseYearsRemaining',
          'freeholder',
          'managementCompany',
        ];
      default:
        return [];
    }
  };

  const getStepProgress = () => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicDetailsStep();
      case 1:
        return renderAddressStep();
      case 2:
        return renderFeaturesStep();
      case 3:
        return renderFinancialStep();
      default:
        return null;
    }
  };

  const renderBasicDetailsStep = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Title *</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Beautiful Victorian House in Central London"
                {...field}
                data-testid="title-input"
              />
            </FormControl>
            <FormDescription>
              Give your property an attractive, descriptive title
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the property's key features, location benefits, and unique selling points..."
                rows={4}
                {...field}
                data-testid="description-input"
              />
            </FormControl>
            <FormDescription>
              Optional but recommended - helps attract potential buyers
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="propertyType-select">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="detached">Detached House</SelectItem>
                  <SelectItem value="semi_detached">
                    Semi-Detached House
                  </SelectItem>
                  <SelectItem value="terraced">Terraced House</SelectItem>
                  <SelectItem value="flat">Flat/Apartment</SelectItem>
                  <SelectItem value="bungalow">Bungalow</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tenure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tenure *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="tenure-select">
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="freehold">Freehold</SelectItem>
                  <SelectItem value="leasehold">Leasehold</SelectItem>
                  <SelectItem value="commonhold">Commonhold</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="address.postcode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postcode *</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., SW1A 1AA"
                {...field}
                onFocus={() => setShowSuggestions(true)}
                data-testid="address-postcode-input"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Address Suggestions */}
      {showSuggestions && (
        <div className="relative">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading addresses...</span>
            </div>
          )}
          {error && (
            <Alert variant="destructive" data-testid="address-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {suggestions.length > 0 && (
            <Command className="absolute z-10 w-full border rounded-md shadow-md bg-background max-h-60 overflow-y-auto">
              <CommandList>
                <CommandEmpty>No addresses found.</CommandEmpty>
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      onSelect={() => {
                        setValue('address.line1', suggestion.line_1 || '');
                        setValue('address.line2', suggestion.line_2 || '');
                        setValue('address.city', suggestion.post_town || '');
                        setValue('address.county', suggestion.county || '');
                        setValue('address.postcode', suggestion.postcode || '');
                        setShowSuggestions(false);
                        clearSuggestions();
                      }}
                      className="cursor-pointer"
                      data-testid={`address-suggestion-${suggestion.id}`}
                    >
                      <div>
                        <strong>{suggestion.line_1}</strong>
                        {suggestion.line_2 && <>, {suggestion.line_2}</>}
                        <br />
                        {suggestion.post_town}, {suggestion.postcode}
                        {suggestion.county && <>, {suggestion.county}</>}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </div>
      )}

      <FormField
        control={form.control}
        name="address.line1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 1 *</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., 123 High Street"
                {...field}
                data-testid="address-line1-input"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address.line2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 2</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Apartment 4B (optional)"
                {...field}
                data-testid="address-line2-input"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="address.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., London"
                  {...field}
                  data-testid="address-city-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address.county"
          render={({ field }) => (
            <FormItem>
              <FormLabel>County</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Greater London"
                  {...field}
                  data-testid="address-county-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address.country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input {...field} disabled data-testid="address-country-input" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderFeaturesStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrooms</FormLabel>
              <FormControl>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0"
                    className="pl-10"
                    {...field}
                    data-testid="bedrooms-input"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bathrooms</FormLabel>
              <FormControl>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0"
                    className="pl-10"
                    {...field}
                    data-testid="bathrooms-input"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receptionRooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reception Rooms</FormLabel>
              <FormControl>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0"
                    className="pl-10"
                    {...field}
                    data-testid="receptionRooms-input"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="floorArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Floor Area (sq ft)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 1200"
                    className="pl-10"
                    {...field}
                    data-testid="floorArea-input"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plotSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plot Size (sq ft)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 2000"
                    className="pl-10"
                    {...field}
                    data-testid="plotSize-input"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="yearBuilt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year Built</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder="e.g., 1985"
                  {...field}
                  data-testid="yearBuilt-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="councilTaxBand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Council Tax Band</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="councilTaxBand-select">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((band) => (
                    <SelectItem key={band} value={band}>
                      Band {band}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="energyRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Energy Rating</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="energyRating-select">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((rating) => (
                    <SelectItem key={rating} value={rating}>
                      {rating} -{' '}
                      {rating === 'A'
                        ? 'Most Efficient'
                        : rating === 'G'
                          ? 'Least Efficient'
                          : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderFinancialStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="askingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asking Price</FormLabel>
              <FormControl>
                <div className="relative">
                  <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 500000"
                    className="pl-10"
                    {...field}
                    data-testid="askingPrice-input"
                  />
                </div>
              </FormControl>
              <FormDescription>
                The price you're asking for the property
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Value</FormLabel>
              <FormControl>
                <div className="relative">
                  <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 480000"
                    className="pl-10"
                    {...field}
                    data-testid="estimatedValue-input"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Professional valuation or estimate
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {watchedTenure === 'leasehold' && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Home className="h-5 w-5" />
              Leasehold Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="monthlyServiceCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Service Charge</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 200"
                          className="pl-10"
                          {...field}
                          data-testid="monthlyServiceCharge-input"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groundRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Ground Rent</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 100"
                          className="pl-10"
                          {...field}
                          data-testid="groundRent-input"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="leaseYearsRemaining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lease Years Remaining</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        max="999"
                        placeholder="e.g., 95"
                        className="pl-10"
                        {...field}
                        data-testid="leaseYearsRemaining-input"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="freeholder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freeholder</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., ABC Estates Ltd"
                        {...field}
                        data-testid="freeholder-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managementCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Management Company</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Property Management Co"
                        {...field}
                        data-testid="managementCompany-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto ${className}`} data-testid={testId}>
      <Form {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Success Message */}
          {submitSuccess && (
            <Alert
              className="border-green-200 bg-green-50"
              data-testid="success-message"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Property {mode === 'create' ? 'created' : 'updated'}{' '}
                successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {submitError && (
            <Alert variant="destructive" data-testid="error-message">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Progress Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>
                    {mode === 'create' ? 'Add New Property' : 'Edit Property'}
                  </CardTitle>
                  <CardDescription>
                    Step {currentStep + 1} of {steps.length}:{' '}
                    {steps[currentStep].title}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-sm">
                  {getStepProgress()}% Complete
                </Badge>
              </div>

              <div className="w-full bg-muted rounded-full h-2 mb-6">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStepProgress()}%` }}
                />
              </div>

              <div className="flex justify-between">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 text-sm ${
                        isActive
                          ? 'text-primary font-medium'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : isCompleted
                              ? 'bg-green-600 text-white'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </div>
                      <span className="hidden md:inline">{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </CardHeader>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps[currentStep].icon, {
                  className: 'h-5 w-5',
                })}
                {steps[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      data-testid="prev-step-button"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      data-testid="cancel-button"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      data-testid="next-step-button"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting || !isValid}
                      data-testid="submit-button"
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {isSubmitting
                        ? mode === 'create'
                          ? 'Creating...'
                          : 'Updating...'
                        : mode === 'create'
                          ? 'Create Property'
                          : 'Update Property'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

// src/domains/properties/components/PropertyForm/PropertyForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Separator,
} from '@/shared/components/ui';
import {
  MapPin,
  FileText,
  Home,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useUkAddressAutocomplete } from '@/shared/hooks';
import type {
  Property,
  CreatePropertyData,
  UpdatePropertyData,
} from '@/domains/properties/types';

// Quick-Start form schema with only essential fields
const propertyFormSchema = z.object({
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    county: z.string().optional(),
    postcode: z.string().min(1, 'Postcode is required'),
    country: z.string(),
  }),
  fileReference: z.string().min(1, 'Property file reference is required'),
  tenure: z.enum(['freehold', 'leasehold'], {
    error: 'Please select the property tenure',
  }),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

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
 * PropertyForm component - Quick-Start single-step form
 * Agent can create a property file in under 30 seconds
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isReferenceManuallyEdited, setIsReferenceManuallyEdited] = useState(
    // In edit mode, if there's already a fileReference, consider it manually edited
    mode === 'edit' && (property as any)?.fileReference ? true : false
  );

  const apiKey =
    import.meta.env.VITE_GETADDRESS_API_KEY || 'your_getaddress_api_key_here';
  const { suggestions, loading, fetchPostcodeLookup, clearSuggestions } =
    useUkAddressAutocomplete(apiKey);

  // Form setup with default values
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      address: {
        line1: property?.address?.line1 || '',
        line2: property?.address?.line2 || '',
        city: property?.address?.city || '',
        county: property?.address?.county || '',
        postcode: property?.address?.postcode || '',
        country: property?.address?.country || 'UK',
      },
      fileReference: (property as any)?.fileReference || '',
      tenure: property?.tenure || 'freehold',
    },
  });

  const { watch, setValue } = form;
  const watchedAddressLine1 = watch('address.line1');
  const watchedFileReference = watch('fileReference');

  // Auto-populate file reference when address is selected
  useEffect(() => {
    if (watchedAddressLine1 && !isReferenceManuallyEdited) {
      // Extract a clean reference from address line 1
      const cleanReference = watchedAddressLine1
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

      if (cleanReference && cleanReference !== watchedFileReference) {
        setValue('fileReference', cleanReference);
      }
    }
  }, [
    watchedAddressLine1,
    isReferenceManuallyEdited,
    setValue,
    watchedFileReference,
  ]);

  // Track manual edits to file reference
  const handleFileReferenceChange = (value: string) => {
    setIsReferenceManuallyEdited(true);
    setValue('fileReference', value);
  };

  const handleFileReferenceBlur = () => {
    // Mark as manually edited when user focuses away from the field
    setIsReferenceManuallyEdited(true);
  };

  const handlePostcodeChange = async (postcode: string) => {
    setValue('address.postcode', postcode);

    if (postcode.length >= 5) {
      try {
        await fetchPostcodeLookup(postcode);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Postcode lookup failed:', err);
      }
    } else {
      setShowSuggestions(false);
      clearSuggestions();
    }
  };

  const handleAddressSelection = (suggestion: any) => {
    setValue('address.line1', suggestion.line_1 || '');
    setValue('address.line2', suggestion.line_2 || '');
    setValue('address.city', suggestion.post_town || '');
    setValue('address.county', suggestion.county || '');
    setValue('address.postcode', suggestion.postcode || '');
    setShowSuggestions(false);
    clearSuggestions();
  };

  const handleSubmit = async (data: PropertyFormData) => {
    setSubmitError(null);

    try {
      // Convert form data to create/update format
      const submitData = {
        ...data,
        // Add minimal required fields for property creation
        title: data.fileReference, // Use file reference as title
        propertyType: 'detached' as const, // Default property type
      };

      await onSubmit(submitData);
      setSubmitSuccess(true);
    } catch (err: any) {
      const message = err?.message || 'Failed to save property file';
      setSubmitError(message);
    }
  };

  if (submitSuccess) {
    return (
      <Card className={`max-w-2xl mx-auto ${className}`} data-testid={testId}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">
                Property File Created Successfully!
              </h3>
              <p className="text-muted-foreground mt-2">
                Your property file has been saved. You can now invite the seller
                to upload documents.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`max-w-2xl mx-auto ${className}`} data-testid={testId}>
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2
              className="text-xl font-semibold leading-none tracking-tight"
              data-slot="card-title"
            >
              {mode === 'edit' ? 'Edit Property File' : 'Create Property File'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Complete in under 30 seconds to start the conveyancing process
            </p>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <Home className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Quick-Start:</strong> Enter the property address, add a file
            reference, and select tenure. That's all you need to begin document
            collection.
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Address Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Property Address</h3>
                <span className="text-red-500">*</span>
              </div>

              {/* Postcode Lookup */}
              <FormField
                control={form.control}
                name="address.postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="e.g., SW1A 1AA"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePostcodeChange(e.target.value);
                          }}
                          data-testid="address-postcode-input"
                        />
                        {loading && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter postcode to search for the property address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-sm font-medium mb-2">Select address:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left p-2 text-sm hover:bg-white rounded border-0 bg-transparent"
                        onClick={() => handleAddressSelection(suggestion)}
                      >
                        {suggestion.line_1}, {suggestion.post_town},{' '}
                        {suggestion.postcode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.line1"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address Line 1 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 123 Oak Street"
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Apartment 4B"
                          {...field}
                          data-testid="address-line2-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
            </div>

            <Separator />

            {/* File Reference Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Case Reference</h3>
                <span className="text-red-500">*</span>
              </div>

              <FormField
                control={form.control}
                name="fileReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property File Reference *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 123 Oak Street - Smith Sale"
                        {...field}
                        onChange={(e) =>
                          handleFileReferenceChange(e.target.value)
                        }
                        onBlur={handleFileReferenceBlur}
                        data-testid="file-reference-input"
                      />
                    </FormControl>
                    <FormDescription>
                      {isReferenceManuallyEdited
                        ? 'Custom reference entered'
                        : 'Auto-populated from address (you can edit this)'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Tenure Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Home className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Property Tenure</h3>
                <span className="text-red-500">*</span>
              </div>

              <FormField
                control={form.control}
                name="tenure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenure *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="tenure-select">
                          <SelectValue placeholder="Select property tenure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="freehold">Freehold</SelectItem>
                        <SelectItem value="leasehold">Leasehold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines which legal documents will be required
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Error Display */}
            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                data-testid="submit-button"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === 'edit'
                  ? 'Update Property File'
                  : 'Create Property File'}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

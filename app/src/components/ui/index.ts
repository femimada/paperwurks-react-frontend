// src/components/ui/index.ts

// Core shadcn/ui components
export { Button } from './button';
export { Input } from './input';
export { Label } from './label';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Badge } from './badge';
export { Alert, AlertDescription, AlertTitle } from './alert';

// Form components
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
} from './form';
export { Textarea } from './textarea';
export { Checkbox } from './checkbox';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

// Layout components
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
} from './dropdown-menu';
export { Popover, PopoverContent, PopoverTrigger } from './popover';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

// Data display
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

// Navigation
export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './command';

// Date/Time
export { Calendar } from './calendar';

// Utility
export { Spinner } from './spinner';

export { Progress } from './progress';

export { Skeleton } from './skeleton';

export { Separator } from './separator';

export * from './breadcrumb';

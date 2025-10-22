import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Save, ArrowLeft, User, Phone, MapPin, Heart, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreatePatient() {
    const { data, setData, post, processing, errors, reset } = useForm({
        // Personal Information - الاسم الثلاثي
        full_name: '',
        date_of_birth: '',
        gender: '',
        address: '', // مكان الإقامة

        // Contact Information - رقم التواصل
        phone: '',
        email: '',

        // Administrative - رقم الإضبارة
        identity_number: '',
        notes: '', // ملاحظات إضافية
        is_active: true,
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [patientId, setPatientId] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/patients', {
            onSuccess: (response) => {
                if (response.props.flash?.success) {
                    toast.success(response.props.flash.success);
                }

                // Check if response has the new JSON structure
                if (response.data && response.data.success) {
                    setShowSuccess(true);
                    setPatientId(response.data.patient?.id);

                    // Reset form after successful creation
                    reset();

                    // Auto-redirect after showing success message
                    setTimeout(() => {
                        if (response.data.redirect_url) {
                            router.visit(response.data.redirect_url);
                        } else {
                            router.visit('/patients');
                        }
                    }, 2000);
                } else {
                    // Fallback for old redirect behavior
                    toast.success('تم إضافة المريض بنجاح');
                    router.visit('/patients');
                }
            },
            onError: (errors) => {
                // Errors are handled in the UI above, no need for toast
                console.log('Validation errors:', errors);
            }
        });
    };

    const genderOptions = [
        { value: 'ذكر', label: 'ذكر' },
        { value: 'أنثى', label: 'أنثى' }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        العودة لقائمة المرضى
                    </Button>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        إضافة مريض جديد
                    </h2>
                </div>
            }
        >
            <Head title="إضافة مريض جديد" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Success Message */}
                    {showSuccess && (
                        <Card className="mb-6 border-green-200 bg-green-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <CheckCircle className="h-6 w-6 text-green-600 ml-3" />
                                    <div>
                                        <h3 className="text-lg font-medium text-green-800">
                                            تم إضافة المريض بنجاح!
                                        </h3>
                                        <p className="text-sm text-green-700 mt-1">
                                            سيتم توجيهك إلى صفحة المريض الجديد...
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                     {/* Error Alert */}
                     {errors.error && (
                         <Card className="mb-6 border-red-200 bg-red-50">
                             <CardContent className="pt-6">
                                 <div className="flex items-center">
                                     <AlertCircle className="h-6 w-6 text-red-600 ml-3" />
                                     <div>
                                         <p className="text-sm text-red-700">{errors.error}</p>
                                     </div>
                                 </div>
                             </CardContent>
                         </Card>
                     )}

                     {/* Validation Errors */}
                     {Object.keys(errors).length > 0 && !errors.error && (
                         <Card className="mb-6 border-red-200 bg-red-50">
                             <CardContent className="pt-6">
                                 <div className="flex items-center">
                                     <AlertCircle className="h-6 w-6 text-red-600 ml-3" />
                                     <div>
                                         <p className="text-sm text-red-700 font-medium mb-2">يرجى تصحيح الأخطاء التالية:</p>
                                         <ul className="text-sm text-red-700 list-disc list-inside">
                                             {Object.entries(errors).map(([field, messages]) => (
                                                 <li key={field}>{messages}</li>
                                             ))}
                                         </ul>
                                     </div>
                                 </div>
                             </CardContent>
                         </Card>
                     )}

                    <form onSubmit={handleSubmit}>
                        {/* Personal Information - المعلومات الشخصية */}
                        <Card className="mb-6" dir="rtl">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="ml-2 h-5 w-5" />
                                    المعلومات الشخصية
                                </CardTitle>
                                <CardDescription>
                                    البيانات الأساسية لتحديد هوية المريض
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="full_name">الاسم الثلاثي *</Label>
                                    <Input
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        placeholder="مثال: أحمد محمد علي"
                                        className={errors.full_name ? 'border-red-500' : ''}
                                    />
                                    {errors.full_name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date_of_birth">تاريخ الميلاد *</Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            className={errors.date_of_birth ? 'border-red-500' : ''}
                                        />
                                        {errors.date_of_birth && (
                                            <p className="text-sm text-red-600 mt-1">{errors.date_of_birth}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">الجنس *</Label>
                                        <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر الجنس" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {genderOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && (
                                            <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">رقم التواصل *</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+966xxxxxxxxx أو 05xxxxxxxx"
                                            className={errors.phone ? 'border-red-500' : ''}
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="example@domain.com"
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address">مكان الإقامة (اختياري)</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="مثال: مدينة الرياض، حي العليا"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="identity_number">رقم الإضبارة (اختياري)</Label>
                                    <Input
                                        id="identity_number"
                                        value={data.identity_number}
                                        onChange={(e) => setData('identity_number', e.target.value)}
                                        placeholder="رقم الهوية أو رقم المريض"
                                        className={errors.identity_number ? 'border-red-500' : ''}
                                    />
                                    {errors.identity_number && (
                                        <p className="text-sm text-red-600 mt-1">{errors.identity_number}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="أي ملاحظات حول الحالة الطبية الأولية..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>


                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4" dir="rtl">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/patients')}
                                disabled={processing}
                            >
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="ml-2 h-4 w-4" />
                                {processing ? 'جاري الحفظ...' : 'حفظ المريض'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
import type { DeliveryFormValues } from '@/types/delivery'
import { isDocumentIdValid } from '@/utils/isDocumentIdValid'
import { isEmailValid } from '@/utils/isEmailValid'
import { isFullNameValid } from '@/utils/isFullNameValid'
import { isNonEmptyText } from '@/utils/isNonEmptyText'
import { isPhoneValid } from '@/utils/isPhoneValid'

const MIN_ADDRESS_LENGTH = 5

export const isDeliveryFormValid = ({
  fullName,
  documentId,
  phone,
  email,
  address,
  city,
  department,
}: DeliveryFormValues) =>
  isFullNameValid(fullName) &&
  isDocumentIdValid(documentId) &&
  isPhoneValid(phone) &&
  isEmailValid(email) &&
  isNonEmptyText(address, MIN_ADDRESS_LENGTH) &&
  isNonEmptyText(city) &&
  isNonEmptyText(department)

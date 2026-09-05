import { RiMapPin2Fill } from 'react-icons/ri'
import { FloatingInput } from '@/components/FloatingInput'
import { FloatingSelect } from '@/components/FloatingSelect'
import type { DeliveryFormValues } from '@/types/delivery'
import { DOCUMENT_TYPES } from '@/utils/documentTypes'
import { getFieldStatus } from '@/utils/getFieldStatus'
import { getStatusIcon } from '@/utils/getStatusIcon'
import { isDocumentIdValid } from '@/utils/isDocumentIdValid'
import { isFullNameValid } from '@/utils/isFullNameValid'
import { isNonEmptyText } from '@/utils/isNonEmptyText'
import { isPhoneValid } from '@/utils/isPhoneValid'
import styles from './DeliveryForm.module.scss'

const MIN_NAME_LENGTH = 3
const MIN_ADDRESS_LENGTH = 5
const PHONE_LENGTH = 10

interface DeliveryFormProps {
  values: DeliveryFormValues
  onChange: (values: DeliveryFormValues) => void
}

export const DeliveryForm = ({ values, onChange }: DeliveryFormProps) => {
  const setField = (field: keyof DeliveryFormValues, value: string) =>
    onChange({ ...values, [field]: value })

  const nameStatus = getFieldStatus(
    values.fullName.trim().length >= MIN_NAME_LENGTH,
    isFullNameValid(values.fullName),
  )

  const documentIdStatus = getFieldStatus(values.documentId.length > 0, isDocumentIdValid(values.documentId))

  const phoneStatus = getFieldStatus(values.phone.length === PHONE_LENGTH, isPhoneValid(values.phone))

  const addressStatus = getFieldStatus(
    values.address.trim().length > 0,
    isNonEmptyText(values.address, MIN_ADDRESS_LENGTH),
  )

  const cityStatus = getFieldStatus(values.city.trim().length > 0, isNonEmptyText(values.city))

  const departmentStatus = getFieldStatus(
    values.department.trim().length > 0,
    isNonEmptyText(values.department),
  )

  return (
    <div className={styles.deliveryForm}>
      <div className={styles.deliveryForm__header}>
        <div className={styles.deliveryForm__badge}>
          <RiMapPin2Fill />
        </div>
        <h3 className={styles.deliveryForm__title}>Datos de entrega</h3>
        <p className={styles.deliveryForm__subtitle}>¿A dónde enviamos tu pedido?</p>
      </div>

      <FloatingInput
        id="fullName"
        label="Nombre completo"
        autoComplete="name"
        value={values.fullName}
        status={nameStatus}
        helperText="Ingresa nombre y apellido"
        trailingIcon={getStatusIcon(nameStatus)}
        onChange={(event) => setField('fullName', event.target.value)}
      />

      <div className={styles.deliveryForm__documentRow}>
        <FloatingSelect
          id="documentType"
          label="Tipo"
          options={DOCUMENT_TYPES}
          value={values.documentType}
          onChange={(event) => setField('documentType', event.target.value)}
        />

        <FloatingInput
          id="documentId"
          label="Número de documento"
          inputMode="numeric"
          autoComplete="off"
          value={values.documentId}
          status={documentIdStatus}
          helperText="Número de documento inválido"
          trailingIcon={getStatusIcon(documentIdStatus)}
          onChange={(event) => setField('documentId', event.target.value.replace(/\D/g, ''))}
        />
      </div>

      <FloatingInput
        id="phone"
        label="Teléfono"
        inputMode="tel"
        autoComplete="tel"
        maxLength={PHONE_LENGTH}
        value={values.phone}
        status={phoneStatus}
        helperText="Ingresa un número de 10 dígitos"
        trailingIcon={getStatusIcon(phoneStatus)}
        onChange={(event) => setField('phone', event.target.value.replace(/\D/g, '').slice(0, PHONE_LENGTH))}
      />

      <FloatingInput
        id="address"
        label="Dirección"
        autoComplete="street-address"
        value={values.address}
        status={addressStatus}
        helperText="Ingresa una dirección completa"
        trailingIcon={getStatusIcon(addressStatus)}
        onChange={(event) => setField('address', event.target.value)}
      />

      <div className={styles.deliveryForm__row}>
        <FloatingInput
          id="city"
          label="Ciudad"
          autoComplete="address-level2"
          value={values.city}
          status={cityStatus}
          helperText="Requerido"
          trailingIcon={getStatusIcon(cityStatus)}
          onChange={(event) => setField('city', event.target.value)}
        />

        <FloatingInput
          id="department"
          label="Departamento"
          autoComplete="address-level1"
          value={values.department}
          status={departmentStatus}
          helperText="Requerido"
          trailingIcon={getStatusIcon(departmentStatus)}
          onChange={(event) => setField('department', event.target.value)}
        />
      </div>
    </div>
  )
}

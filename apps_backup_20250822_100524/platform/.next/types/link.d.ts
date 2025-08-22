// Type definitions for Next.js routes

/**
 * Internal types used by the Next.js router and Link component.
 * These types are not meant to be used directly.
 * @internal
 */
declare namespace __next_route_internal_types__ {
  type SearchOrHash = `?${string}` | `#${string}`
  type WithProtocol = `${string}:${string}`

  type Suffix = '' | SearchOrHash

  type SafeSlug<S extends string> = S extends `${string}/${string}`
    ? never
    : S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S

  type CatchAllSlug<S extends string> = S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S

  type OptionalCatchAllSlug<S extends string> =
    S extends `${string}${SearchOrHash}` ? never : S

  type StaticRoutes = 
    | `/`
    | `/academy`
    | `/admin`
    | `/admin/api/login`
    | `/admin/appointments`
    | `/admin/courses`
    | `/admin/courses/send`
    | `/admin/dashboard/templates`
    | `/admin/login`
    | `/admin/services`
    | `/admin/templates`
    | `/admin/templates/send`
    | `/api/appointments`
    | `/api/auth/login`
    | `/api/auth/logout`
    | `/api/auth/me`
    | `/api/auth/register`
    | `/api/auth/update-mode`
    | `/api/availability`
    | `/api/business/settings`
    | `/api/chat`
    | `/api/payment/verify`
    | `/api/practitioner/dashboard`
    | `/api/public/availability`
    | `/api/public/bookings`
    | `/api/public/enrollments`
    | `/api/public/treatments`
    | `/api/services`
    | `/api/stripe/create-payment-intent`
    | `/api/stripe/webhook`
    | `/auth/signin`
    | `/auth/signup`
    | `/book`
    | `/booking`
    | `/client-login`
    | `/clinic`
    | `/courses`
    | `/dashboard`
    | `/demo-booking`
    | `/demo-booking/confirmed`
    | `/login`
    | `/payment/success`
    | `/portal/client`
    | `/portal/student`
    | `/profile`
    | `/register`
    | `/student`
    | `/student-login`
    | `/web`
    | `/web/academy`
    | `/web/api/chat`
    | `/web/booking`
    | `/web/client-login`
    | `/web/clinic`
    | `/web/demo-booking`
    | `/web/demo-booking/confirmed`
    | `/web/student`
    | `/web/student-login`
  type DynamicRoutes<T extends string = string> = 
    | `/${SafeSlug<T>}`
    | `/admin/${OptionalCatchAllSlug<T>}`
    | `/admin/dashboard/templates/${SafeSlug<T>}`
    | `/admin/templates/${SafeSlug<T>}`
    | `/api/services/${SafeSlug<T>}`
    | `/web/${OptionalCatchAllSlug<T>}`
    | `/web/${SafeSlug<T>}`

  type RouteImpl<T> = 
    | StaticRoutes
    | SearchOrHash
    | WithProtocol
    | `${StaticRoutes}${SearchOrHash}`
    | (T extends `${DynamicRoutes<infer _>}${Suffix}` ? T : never)
    
}

declare module 'next' {
  export { default } from 'next/types.js'
  export * from 'next/types.js'

  export type Route<T extends string = string> =
    __next_route_internal_types__.RouteImpl<T>
}

declare module 'next/link' {
  import type { LinkProps as OriginalLinkProps } from 'next/dist/client/link.js'
  import type { AnchorHTMLAttributes, DetailedHTMLProps } from 'react'
  import type { UrlObject } from 'url'

  type LinkRestProps = Omit<
    Omit<
      DetailedHTMLProps<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >,
      keyof OriginalLinkProps
    > &
      OriginalLinkProps,
    'href'
  >

  export type LinkProps<RouteInferType> = LinkRestProps & {
    /**
     * The path or URL to navigate to. This is the only required prop. It can also be an object.
     * @see https://nextjs.org/docs/api-reference/next/link
     */
    href: __next_route_internal_types__.RouteImpl<RouteInferType> | UrlObject
  }

  export default function Link<RouteType>(props: LinkProps<RouteType>): JSX.Element
}

declare module 'next/navigation' {
  export * from 'next/dist/client/components/navigation.js'

  import type { NavigateOptions, AppRouterInstance as OriginalAppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime.js'
  interface AppRouterInstance extends OriginalAppRouterInstance {
    /**
     * Navigate to the provided href.
     * Pushes a new history entry.
     */
    push<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>, options?: NavigateOptions): void
    /**
     * Navigate to the provided href.
     * Replaces the current history entry.
     */
    replace<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>, options?: NavigateOptions): void
    /**
     * Prefetch the provided href.
     */
    prefetch<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>): void
  }

  export function useRouter(): AppRouterInstance;
}

declare module 'next/form' {
  import type { FormProps as OriginalFormProps } from 'next/dist/client/form.js'

  type FormRestProps = Omit<OriginalFormProps, 'action'>

  export type FormProps<RouteInferType> = {
    /**
     * `action` can be either a `string` or a function.
     * - If `action` is a string, it will be interpreted as a path or URL to navigate to when the form is submitted.
     *   The path will be prefetched when the form becomes visible.
     * - If `action` is a function, it will be called when the form is submitted. See the [React docs](https://react.dev/reference/react-dom/components/form#props) for more.
     */
    action: __next_route_internal_types__.RouteImpl<RouteInferType> | ((formData: FormData) => void)
  } & FormRestProps

  export default function Form<RouteType>(props: FormProps<RouteType>): JSX.Element
}

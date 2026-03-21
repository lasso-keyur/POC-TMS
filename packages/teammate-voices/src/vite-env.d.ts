/// <reference types="vite/client" />

declare module '@arya/design-system' {
  import type { FC, ForwardRefExoticComponent, RefAttributes, ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react'

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
    loading?: boolean
    iconBefore?: React.ReactNode
    iconAfter?: React.ReactNode
  }

  export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'filled' | 'outlined'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hoverable?: boolean
    pressable?: boolean
    glass?: boolean
  }

  export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: 'sm' | 'md' | 'lg'
    error?: boolean
    helperText?: string
    label?: string
    iconBefore?: React.ReactNode
    iconAfter?: React.ReactNode
    fullWidth?: boolean
  }

  export const Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>
  export const Card: ForwardRefExoticComponent<CardProps & RefAttributes<HTMLDivElement>>
  export const CardHeader: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>
  export const CardBody: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>
  export const CardFooter: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>
  export const Input: ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>
}

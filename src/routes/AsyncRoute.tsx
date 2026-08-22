import { Component, Suspense, use, useEffect, useState, type ReactNode } from "react";
import { useLocation, useParams } from "react-router-dom";
import { PageError, PageLoading } from "@/components/PageState";
import { useI18n } from "@/components/i18n/LocaleProvider";

type PageProps = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
};
type AsyncPage = (props: PageProps) => ReactNode | Promise<ReactNode>;
const cache = new Map<string, Promise<ReactNode>>();

function load(page: AsyncPage, key: string, props: PageProps) {
  let promise = cache.get(key);
  if (!promise) {
    promise = Promise.resolve(page(props));
    cache.set(key, promise);
  }
  return promise;
}

function Resolved({ page, cacheKey, props }: { page: AsyncPage; cacheKey: string; props: PageProps }) {
  return use(load(page, cacheKey, props));
}

class Boundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() { return this.state.error ? <PageError error={this.state.error} /> : this.props.children; }
}

export function AsyncRoute({ page }: { page: unknown }) {
  const location = useLocation();
  const params = useParams();
  const { locale } = useI18n();
  const [version, setVersion] = useState(0);
  const baseKey = `${locale}:${location.pathname}${location.search}`;
  const key = `${baseKey}:${version}`;
  const search = Object.fromEntries(new URLSearchParams(location.search));
  const props = {
    params: Promise.resolve(params as Record<string, string>),
    searchParams: Promise.resolve(search),
  };

  useEffect(() => {
    const refresh = () => {
      cache.delete(key);
      setVersion((value) => value + 1);
    };
    window.addEventListener("storefront:refresh", refresh);
    return () => window.removeEventListener("storefront:refresh", refresh);
  }, [key]);

  return <Boundary key={key}><Suspense fallback={<PageLoading />}><Resolved page={page as AsyncPage} cacheKey={key} props={props} /></Suspense></Boundary>;
}

export function AsyncContent({ render, cacheKey }: { render: () => Promise<ReactNode>; cacheKey: string }) {
  const [version, setVersion] = useState(0);
  const key = `${cacheKey}:${version}`;
  useEffect(() => {
    const refresh = () => {
      cache.delete(key);
      setVersion((value) => value + 1);
    };
    window.addEventListener("storefront:refresh", refresh);
    return () => window.removeEventListener("storefront:refresh", refresh);
  }, [key]);
  return <Boundary key={key}><Suspense fallback={null}><Resolved page={() => render()} cacheKey={key} props={{ params: Promise.resolve({}), searchParams: Promise.resolve({}) }} /></Suspense></Boundary>;
}

function clean<T>(obj: T): T {
  const stripped = JSON.parse(JSON.stringify(obj));
  function fixNested(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => {
        if (Array.isArray(item)) {
          return { valores: fixNested(item) };
        }
        return fixNested(item);
      });
    } else if (value && typeof value === 'object') {
      const out: any = {};
      for (const key in value) out[key] = fixNested(value[key]);
      return out;
    }
    return value;
  }
  return fixNested(stripped);
}

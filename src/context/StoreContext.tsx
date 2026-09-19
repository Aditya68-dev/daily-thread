*** Begin Patch
*** Update File: src/context/StoreContext.tsx
@@
   const createOrder = async (orderData: any) => {
     try {
+      if (!user?.id) {
+        throw new Error('Silakan login dengan Google sebelum membuat pesanan.');
+      }
@@
-      const result = await orderService.createOrder(fullOrderPayload, user?.id);
+      const result = await orderService.createOrder(fullOrderPayload, user.id);
*** End Patch
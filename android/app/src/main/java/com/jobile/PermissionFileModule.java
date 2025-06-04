package com.jobile;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import java.io.File;

@ReactModule(name = PermissionFileModule.NAME)
public class PermissionFileModule extends ReactContextBaseJavaModule {
    public static final String NAME = "PermissionFileModule";
    private final ReactApplicationContext reactContext;

    public PermissionFileModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void checkStoragePermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                // Android 11 (API 30) and above
                if (Environment.isExternalStorageManager()) {
                    promise.resolve(true);
                } else {
                    promise.resolve(false);
                }
            } else {
                // Below Android 11
                int writePermission = ContextCompat.checkSelfPermission(
                        reactContext,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE
                );
                
                promise.resolve(writePermission == PackageManager.PERMISSION_GRANTED);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestStoragePermission(Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            
            if (currentActivity == null) {
                promise.reject("ERROR", "Activity is null");
                return;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                // Android 11 (API 30) and above
                try {
                    Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                    Uri uri = Uri.parse("package:" + reactContext.getPackageName());
                    intent.setData(uri);
                    currentActivity.startActivity(intent);
                    promise.resolve(true);
                } catch (Exception e) {
                    Intent intent = new Intent();
                    intent.setAction(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    currentActivity.startActivity(intent);
                    promise.resolve(true);
                }
            } else {
                // Below Android 11
                String[] permissions = {
                        Manifest.permission.READ_EXTERNAL_STORAGE,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE
                };
                
                ActivityCompat.requestPermissions(currentActivity, permissions, 1);
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void createDownloadDirectory(Promise promise) {
        try {
            File dir = new File(Environment.getExternalStorageDirectory(), "Download");
            if (!dir.exists()) {
                boolean success = dir.mkdirs();
                if (success) {
                    promise.resolve("Download directory created successfully");
                } else {
                    promise.reject("ERROR", "Failed to create Download directory");
                }
            } else {
                promise.resolve("Download directory already exists");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getDownloadPath(Promise promise) {
        try {
            String path = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath();
            promise.resolve(path);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
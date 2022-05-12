﻿using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace ordercloud.integrations.library.cosmos_repo
{
    /// <summary>
    /// Extension methods for IApplicationBuilder
    /// </summary>
    public static class IApplicationBuilderExtensions
    {
        /// <summary>
        /// Ensure Cosmos DB is created
        /// </summary>
        /// <param name="builder"></param>
        public static void EnsureCosmosDbIsCreated(this IApplicationBuilder builder)
        {
            using (IServiceScope serviceScope = builder.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                ICosmosDbContainerFactory factory = serviceScope.ServiceProvider.GetService<ICosmosDbContainerFactory>();
                if (factory != null)
                {
                    factory.EnsureDbSetupAsync().Wait();
                }
            }
        }
    }
}
